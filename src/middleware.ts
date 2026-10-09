import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { refreshTokenAPI } from './services/opreations/auth';


function isTokenExpired(token: string) {
  // 1.  middle part of token
  const payloadBase64 = token.split('.')[1];

  // 2. Base64 string ko padhne-laayak JSON object banaya
  const jsonPayload = JSON.parse(atob(payloadBase64));

  // time
  const currentTime = Math.floor(Date.now() / 1000);

  // exp 
  return jsonPayload.exp < currentTime;

}


// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

  const url = request.nextUrl;
  const isAuthPage =
    url.pathname.startsWith('/authentication/sign-in') ||
    url.pathname.startsWith('/authentication/sign-up') ||
    url.pathname.startsWith('/authentication/sign-verify');

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  let isAccessValid = accessToken ? !isTokenExpired(accessToken) : false;

  if (!isAccessValid && refreshToken && !isAuthPage) {
    try {
      const res = await refreshTokenAPI().action({ refreshToken });
      const response = NextResponse.next();

      // Backend response se aayi cookies (accessToken aur refreshToken) ko browser response me forward karein
      if (res.data?.data) {
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        if (accessToken) response.cookies.set('accessToken', accessToken, { httpOnly: true, secure: true });
        if (newRefreshToken) response.cookies.set('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
        return response;
      }
    } catch (error) {
      const redirectRes = NextResponse.redirect(new URL('/authentication/sign-in', request.url));
      redirectRes.cookies.delete('accessToken');
      redirectRes.cookies.delete('refreshToken');
      return redirectRes;
    }
  }



  if (!isAccessValid &&
    (
      url.pathname.startsWith('/tasks/dashboard') ||
      url.pathname.startsWith('/tasks/verify')
    )
  ) {
    return NextResponse.redirect(new URL('/authentication/sign-in', request.url))
  }
  if (isAccessValid &&
    (url.pathname.startsWith('/authentication/sign-in') ||
      url.pathname.startsWith('/authentication/sign-up') ||
      url.pathname.startsWith('/authentication/sign-verify'))
  ) {
    return NextResponse.redirect(new URL('/tasks/dashboard', request.url))
  }
  if (isAccessValid && url.pathname === "/") {
    return NextResponse.redirect(new URL('/tasks/dashboard', request.url))
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/authentication/sign-in',
    '/authentication/sign-up',
    '/',
    '/tasks/dashboard/:path*',
    '/verify/:path*',
  ],
};