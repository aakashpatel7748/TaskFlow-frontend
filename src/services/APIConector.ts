import { ApiErrorResponse } from "@/types/ApiResponce";
import axios, {
    AxiosError
} from "axios";
import Cookies from "js-cookie";
import { autthEndPoints } from "./apiEndpoints";

// Create Axios instance with base configuration
export const axiosInstance = axios.create({
    withCredentials: true, // Ensures cookies are sent with requests
});

// Function to fetch authentication and secret key
const getAuthHeaders = () => {
    const token = Cookies.get("accessToken");
    const secretKey = process.env.MY_SECRET_KEY;

    return {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(secretKey && { "x-secret-key": secretKey }),
    };
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        // Prevent infinite loop if refresh token route itself fails
        if (originalRequest?.url?.includes("/user/refresh-token")) {
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized / Token Expired
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Read non-httpOnly refreshToken if stored in JS cookie, or send empty body
                const refreshToken = Cookies.get("refreshToken");

                const refreshRes = await axios.post(
                    autthEndPoints.REFRESH_TOKEN_ROUTE,
                    refreshToken ? { refreshToken } : {},
                    { withCredentials: true }
                );

                const newAccessToken = refreshRes.data?.data?.accessToken;
                const newRefreshToken = refreshRes.data?.data?.refreshToken;

                if (newAccessToken) {
                    Cookies.set("accessToken", newAccessToken);
                    if (newRefreshToken) {
                        Cookies.set("refreshToken", newRefreshToken);
                    }

                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
                if (typeof window !== "undefined" && !window.location.pathname.startsWith("/authentication")) {
                    window.location.href = "/authentication/sign-in";
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const apiConnector = async (method: string, url: string, bodyData?: unknown, headers = {}, params = null) => {
    try {
        const response = await axiosInstance({
            method,
            url,
            data: bodyData,
            headers: { ...headers, ...getAuthHeaders() },
            params,
        });

        return response;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        console.error("API Error:", axiosError.response?.data.message || axiosError.message);
        return Promise.reject(error);
    }
};
