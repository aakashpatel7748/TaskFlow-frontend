export interface SignUpPayload {
    username?: string;
    email?: string;
    password?: string;
    fullName?: string;
}

export interface LoginPayload {
    identifier?: string;
    password?: string;
}

export interface ForgotPasswordPayload {
    email?: string;
}

export interface ResetPasswordPayload {
    token?: string;
    password?: string;
}

export interface User {
    _id?: string;
    username?: string;
    email?: string;
    fullName?: string;
}

export interface AuthResponse {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
}