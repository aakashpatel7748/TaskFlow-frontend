"use client";

import { toast } from "@/components/ui/toast";
import { checkUsernameUnique, googleLoginAPI, signUpAPI } from "@/services/opreations/auth";
import { ApiErrorResponse, ApiResponse } from "@/types/ApiResponce";
import { SignUpPayload } from "@/types/auth";
import { AxiosError } from "axios";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";

import { TaskFlowLogo } from "@/components/common/TaskFlowLogo";

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Page = () => {

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const debounce = useDebounceCallback(setUsername, 300);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsername = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");

        try {
          const response = await checkUsernameUnique().action({ username });
          const message = response?.data?.message;
          setUsernameMessage(message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          console.log("Axios Error:", axiosError);
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsername();
  }, [username]);

  const onSubmit = async (data: SignUpPayload) => {
    setIsSubmitting(true);
    try {
      const payload = token ? { ...data, inviteToken: token } : data;
      const response = await signUpAPI().action(payload);
      toast.add({
        title: "Success",
        description: `${response.data.message}`,
      });
      router.replace(`/authentication/sign-in`);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in signup user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMsg = axiosError.response?.data.message;
      toast.add({
        title: "Signup failed",
        description: errorMsg,
      });
      setIsSubmitting(false);
    }
  };

  // google login 
  const googleLogin = async () => {
    setIsSubmitting(true);
    try {
      await googleLoginAPI()
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in login user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMsg = axiosError.response?.data.message;
      toast.add({
        title: "Login failed",
        description: errorMsg,
      });
      setIsSubmitting(false);
    }
  }

  // invitation accting 
  useEffect(() => {
    if (email) {
      form.setValue("email", email)
    }
  }, [email, form])

  return (
    <div className="relative min-h-screen bg-[#FAFCFF] flex flex-col justify-between items-center px-4 py-8 overflow-hidden font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Background Soft Pastel Gradient Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-80 blur-3xl bg-gradient-to-r from-pink-200/50 via-purple-200/50 to-sky-200/50 -z-10" />

      <div className="w-full my-auto flex flex-col items-center justify-center">
        {/* Main Card Container */}
        <div className="w-full max-w-[420px] bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)]">
          {/* Header & Logo */}
          <TaskFlowLogo size="lg" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight text-center mt-4 mb-1">
            Get started with TaskFlow
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Already have an account?{" "}
            <Link
              href="/authentication/sign-in"
              className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
            >
              Log in
            </Link>
          </p>

          {/* Social / SSO Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={googleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50/80 text-gray-700 text-sm font-medium transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <GoogleIcon />
              Continue with Google
            </button>

          </div>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/70" />
            </div>
            <span className="relative bg-white px-3 text-xs text-gray-400 font-medium lowercase">
              or
            </span>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <div className="relative">
                    <input
                      {...field}
                      id="username"
                      type="text"
                      onChange={(e) => {
                        field.onChange(e);
                        debounce(e.target.value);
                      }}
                      placeholder="Username"
                      autoComplete="off"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none ${fieldState.invalid
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-300 focus:border-gray-500 focus:ring-3 focus:ring-gray-100"
                        }`}
                    />
                    {isCheckingUsername && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                  {usernameMessage && (
                    <p
                      className={`mt-1 text-xs ${usernameMessage === "Usernaem is unique" ||
                        usernameMessage === "Username is unique"
                        ? "text-emerald-600 font-medium"
                        : "text-red-500"
                        }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  {fieldState.invalid && fieldState.error && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <div className="relative">
                    <input
                      {...field}
                      id="fullName"
                      type="text"
                      placeholder="Full Name"
                      autoComplete="off"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none ${fieldState.invalid
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-300 focus:border-gray-500 focus:ring-3 focus:ring-gray-100"
                        }`}
                    />
                  </div>
                  {fieldState.invalid && fieldState.error && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <div className="relative">
                    <input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Email address"
                      autoComplete="off"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none ${fieldState.invalid
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-300 focus:border-gray-500 focus:ring-3 focus:ring-gray-100"
                        }`}
                    />
                  </div>
                  {fieldState.invalid && fieldState.error && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <div className="relative">
                    <input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="off"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 pr-10 transition-all outline-none ${fieldState.invalid
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-300 focus:border-gray-500 focus:ring-3 focus:ring-gray-100"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && fieldState.error && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-[#7B68EE] hover:bg-[#6C56E8] active:bg-[#5C45D8] text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-500/15 transition-all focus:ring-3 focus:ring-indigo-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                "Play with TaskFlow"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer link */}
      <footer className="mt-6 text-center">
        <a
          href="#"
          className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          Need help?
        </a>
      </footer>
    </div>
  );
};

export default Page;

