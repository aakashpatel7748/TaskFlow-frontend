import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
const channel = new BroadcastChannel('auth');

export const setAppSession = (name: string, value: string) => {
  try {
    const expirationDate = new Date();
    expirationDate.setHours(2, 0, 0, 0);

    if (expirationDate.getTime() <= Date.now()) {
      expirationDate.setDate(expirationDate.getDate() + 1);
    }
    const options = { expires: expirationDate, path: '/' };
    Cookies.set(name, value, options);

  } catch (error) {
    console.error("Error setting app session:", error);

  }
};


// for all tabs to reload
channel.onmessage = (event) => {
  if (event.data === 'reloadTabs') {
    window.location.reload();
  }
};

export const getAppSession = () => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) {
      return null;
    }
    const decodedToken = jwt.decode(token);
    return decodedToken;
  } catch (error) { return null; }
};

export function removeAppSession() {
  const cookies = document.cookie.split(';');

  cookies.forEach((cookie) => {
    const cookieParts = cookie.split('=');
    const cookieName = cookieParts[0].trim();
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  // Notify all tabs to reload
  channel.postMessage('reloadTabs');

  return window.location.href = '/authentication/sign-in';
};

