"use client";

import React from "react";
import { CheckCircle2, Clock3, CircleDashed } from "lucide-react";
import { StatusBreakdown } from "@/types/dashboard";

interface StatusDistributionWidgetProps {
    statusBreakdown: StatusBreakdown;
    total: number;
}

export const StatusDistributionWidget: React.FC<StatusDistributionWidgetProps> = ({
    statusBreakdown,
    total
}) => {
    const todo = statusBreakdown["to-do"] || 0;
    const inProgress = statusBreakdown["in-progress"] || 0;
    const completed = statusBreakdown.completed || 0;

    const todoPct = total > 0 ? Math.round((todo / total) * 100) : 0;
    const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const completedPct = total > 0 ? Math.max(0, 100 - todoPct - inProgressPct) : 0;

    return (
        <div
            style={{
                backgroundColor: "var(--color-primary-light)",
                borderColor: "var(--color-stroke)"
            }}
            className="p-5 rounded-2xl border shadow-sm space-y-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3
                        style={{ color: "var(--foreground)" }}
                        className="text-sm font-bold tracking-tight"
                    >
                        Task Status Distribution
                    </h3>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-xs">
                        {total} total workspace tasks
                    </p>
                </div>
                <span
                    style={{
                        backgroundColor: "rgba(46, 204, 113, 0.12)",
                        color: "var(--color-success)"
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                >
                    {completedPct}% Completed
                </span>
            </div>

            {/* Segmented Progress Bar */}
            <div
                style={{ backgroundColor: "var(--color-primary)" }}
                className="w-full h-3 rounded-full overflow-hidden flex p-0.5 gap-0.5"
            >
                {completedPct > 0 && (
                    <div
                        style={{
                            width: `${completedPct}%`,
                            backgroundColor: "var(--color-success)"
                        }}
                        className="h-full rounded-sm transition-all duration-500"
                        title={`Completed: ${completed} (${completedPct}%)`}
                    />
                )}
                {inProgressPct > 0 && (
                    <div
                        style={{
                            width: `${inProgressPct}%`,
                            backgroundColor: "var(--color-tertiary)"
                        }}
                        className="h-full rounded-sm transition-all duration-500"
                        title={`In Progress: ${inProgress} (${inProgressPct}%)`}
                    />
                )}
                {todoPct > 0 && (
                    <div
                        style={{
                            width: `${todoPct}%`,
                            backgroundColor: "var(--color-orange)"
                        }}
                        className="h-full rounded-sm transition-all duration-500"
                        title={`To Do: ${todo} (${todoPct}%)`}
                    />
                )}
                {total === 0 && (
                    <div
                        style={{ backgroundColor: "var(--color-secondary-dark)", opacity: 0.3 }}
                        className="w-full h-full rounded-sm"
                    />
                )}
            </div>

            {/* Status Breakdown Legend */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                <div
                    style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="p-2.5 rounded-xl border flex flex-col gap-1"
                >
                    <div className="flex items-center gap-1.5">
                        <CircleDashed className="w-3.5 h-3.5 text-[var(--color-orange)]" />
                        <span style={{ color: "var(--color-secondary-dark)" }} className="text-[11px] font-medium">
                            To Do
                        </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-0.5">
                        <span style={{ color: "var(--foreground)" }} className="text-base font-extrabold">
                            {todo}
                        </span>
                        <span style={{ color: "var(--color-secondary-dark)" }} className="text-[10px] font-mono">
                            {todoPct}%
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="p-2.5 rounded-xl border flex flex-col gap-1"
                >
                    <div className="flex items-center gap-1.5">
                        <Clock3 className="w-3.5 h-3.5 text-[var(--color-tertiary)]" />
                        <span style={{ color: "var(--color-secondary-dark)" }} className="text-[11px] font-medium">
                            In Progress
                        </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-0.5">
                        <span style={{ color: "var(--foreground)" }} className="text-base font-extrabold">
                            {inProgress}
                        </span>
                        <span style={{ color: "var(--color-secondary-dark)" }} className="text-[10px] font-mono">
                            {inProgressPct}%
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="p-2.5 rounded-xl border flex flex-col gap-1"
                >
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />
                        <span style={{ color: "var(--color-secondary-dark)" }} className="text-[11px] font-medium">
                            Done
                        </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-0.5">
                        <span style={{ color: "var(--foreground)" }} className="text-base font-extrabold">
                            {completed}
                        </span>
                        <span style={{ color: "var(--color-secondary-dark)" }} className="text-[10px] font-mono">
                            {completedPct}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
