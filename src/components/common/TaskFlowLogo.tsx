"use client";

import React from "react";

interface TaskFlowLogoProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const TaskFlowLogo: React.FC<TaskFlowLogoProps> = ({ size = "md", className = "" }) => {
    // Exact sizing configurations
    const config = {
        sm: {
            container: "w-8 h-8 rounded-xl p-[1.5px]",
            inner: "rounded-[10px]",
            svg: "w-4.5 h-4.5",
            stroke: "3.5"
        },
        md: {
            container: "w-10 h-10 rounded-2xl p-[1.5px]",
            inner: "rounded-[13px]",
            svg: "w-5.5 h-5.5",
            stroke: "3.5"
        },
        lg: {
            container: "w-12 h-12 rounded-2xl p-0.5",
            inner: "rounded-[14px]",
            svg: "w-7 h-7",
            stroke: "3.5"
        }
    }[size];

    return (
        <div className={`flex items-center justify-center shrink-0 ${className}`}>
            {/* Outer theme-matched gradient ring */}
            <div
                className={`${config.container} bg-gradient-to-tr from-[#36abf9] via-[#6366f1] to-[#8b5cf6] shadow-lg shadow-[#6366f1]/25 dark:shadow-[#36abf9]/20 flex items-center justify-center`}
            >
                {/* Inner background: white in light theme, sleek dark navy in dark theme */}
                <div
                    className={`w-full h-full ${config.inner} flex items-center justify-center bg-white dark:bg-[#202138] border border-black/5 dark:border-white/10`}
                >
                    <svg
                        className={config.svg}
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Upper Chevron */}
                        <path
                            d="M7 13.5L16 6.5L25 13.5"
                            stroke="url(#tf_paint0)"
                            strokeWidth={config.stroke}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Lower Chevron */}
                        <path
                            d="M7 21.5L16 14.5L25 21.5"
                            stroke="url(#tf_paint1)"
                            strokeWidth={config.stroke}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <defs>
                            {/* Gradient 0: TaskFlow signature sky blue -> indigo -> violet */}
                            <linearGradient
                                id="tf_paint0"
                                x1="7"
                                y1="6.5"
                                x2="25"
                                y2="13.5"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor="#36abf9" />
                                <stop offset="50%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>

                            {/* Gradient 1: Violet -> Indigo -> Electric Cyan */}
                            <linearGradient
                                id="tf_paint1"
                                x1="7"
                                y1="14.5"
                                x2="25"
                                y2="21.5"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="50%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default TaskFlowLogo;
