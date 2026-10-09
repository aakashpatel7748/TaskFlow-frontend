import { LoginPayload, SignUpPayload } from "@/types/auth";
import { apiConnector } from "../APIConector";
import { autthEndPoints } from "../apiEndpoints";

const { GET_LOGIN_ROUTE, LOGOUT_ROUTE, SIGNUP_ROUTE, CHECK_USERNAME_ROUTE, GOOGLE_LOGIN_ROUTE, REFRESH_TOKEN_ROUTE } = autthEndPoints

export function signUpAPI() {
    return {
        action: (values: SignUpPayload) => apiConnector("POST", `${SIGNUP_ROUTE}`, values)
    }
}


export function loginAPI() {
    return {
        action: (values: LoginPayload) => apiConnector("POST", `${GET_LOGIN_ROUTE}`, values)
    }
}

export function googleLoginAPI() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}${GOOGLE_LOGIN_ROUTE}`;
}

export function logoutAPI() {
    return {
        action: () => apiConnector("POST", `${LOGOUT_ROUTE}`)
    }
}

export function checkUsernameUnique() {
    return {
        action: (values: { username: string }) => apiConnector("POST", `${CHECK_USERNAME_ROUTE}`, values)
    }
}

export function refreshTokenAPI() {
    return {
        action: (values: { refreshToken: string }) => apiConnector("POST", `${REFRESH_TOKEN_ROUTE}`, values)
    }
}