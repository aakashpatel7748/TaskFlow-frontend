"use client";

import React from "react";

interface StatMetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        label: string;
        positive?: boolean;
    };
    accentColor?: string; // CSS color string or variable
    progressPercent?: number;
    onClick?: () => void;
}

export const StatMetricCard: React.FC<StatMetricCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    accentColor = "var(--color-tertiary)",
    progressPercent,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: "var(--color-primary-light)",
                borderColor: "var(--color-stroke)",
                color: "var(--foreground)"
            }}
            className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all duration-200 ${
                onClick ? "cursor-pointer hover:translate-y-[-2px] hover:shadow-md" : ""
            } flex flex-col justify-between`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                    <p
                        style={{ color: "var(--color-secondary-dark)" }}
                        className="text-[11px] font-bold uppercase tracking-wider truncate"
                    >
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span
                            style={{ color: "var(--foreground)" }}
                            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                        >
                            {value}
                        </span>
                        {trend && (
                            <span
                                style={{
                                    color: trend.positive
                                        ? "var(--color-success)"
                                        : "var(--color-error)",
                                    backgroundColor: trend.positive
                                        ? "rgba(46, 204, 113, 0.12)"
                                        : "rgba(231, 76, 60, 0.12)"
                                }}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            >
                                {trend.label}
                            </span>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-stroke)",
                        color: accentColor
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-inner"
                >
                    {icon}
                </div>
            </div>

            {/* Optional Progress Bar */}
            {progressPercent !== undefined && (
                <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                        <span style={{ color: "var(--color-secondary-dark)" }} className="font-medium">
                            Completion
                        </span>
                        <span style={{ color: "var(--color-secondary)" }} className="font-bold">
                            {progressPercent}%
                        </span>
                    </div>
                    <div
                        style={{ backgroundColor: "var(--color-primary)" }}
                        className="w-full h-1.5 rounded-full overflow-hidden"
                    >
                        <div
                            style={{
                                width: `${Math.min(Math.max(progressPercent, 0), 100)}%`,
                                backgroundColor: accentColor
                            }}
                            className="h-full rounded-full transition-all duration-500"
                        />
                    </div>
                </div>
            )}

            {subtitle && progressPercent === undefined && (
                <p
                    style={{ color: "var(--color-secondary-dark)" }}
                    className="text-[11px] mt-3 font-medium truncate"
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
};
