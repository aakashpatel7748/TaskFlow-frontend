"use client";

import React from "react";
import { CircleDashed, Clock3, CheckCircle2, Flame, AlertCircle } from "lucide-react";
import { StatusBreakdown, PriorityBreakdown } from "@/types/dashboard";

interface TaskVelocityPanelProps {
    statusBreakdown: StatusBreakdown;
    priorityBreakdown: PriorityBreakdown;
    totalTasks: number;
}

export const TaskVelocityPanel: React.FC<TaskVelocityPanelProps> = ({
    statusBreakdown,
    priorityBreakdown,
    totalTasks
}) => {
    const todo = statusBreakdown["to-do"] || 0;
    const inProgress = statusBreakdown["in-progress"] || 0;
    const completed = statusBreakdown.completed || 0;

    const todoPct = totalTasks > 0 ? Math.round((todo / totalTasks) * 100) : 0;
    const inProgressPct = totalTasks > 0 ? Math.round((inProgress / totalTasks) * 100) : 0;
    const completedPct = totalTasks > 0 ? Math.max(0, 100 - todoPct - inProgressPct) : 0;

    const priorities = [
        { label: "Urgent", count: priorityBreakdown.urgent || 0, color: "var(--color-error)" },
        { label: "High", count: priorityBreakdown.high || 0, color: "var(--color-orange)" },
        { label: "Medium", count: priorityBreakdown.medium || 0, color: "var(--color-tertiary)" },
        { label: "Low", count: priorityBreakdown.low || 0, color: "var(--color-secondary-dark)" }
    ];

    return (
        <div
            style={{
                backgroundColor: "var(--color-primary-light)",
                borderColor: "var(--color-stroke)"
            }}
            className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between h-full space-y-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3
                        style={{ color: "var(--foreground)" }}
                        className="text-sm font-bold tracking-tight"
                    >
                        Task Execution & Velocity
                    </h3>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-xs">
                        Sprint delivery status across workspace
                    </p>
                </div>
                <span
                    style={{
                        backgroundColor: "rgba(46, 204, 113, 0.12)",
                        color: "var(--color-success)"
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-full font-mono"
                >
                    {completedPct}% Completed
                </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-2">
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
                    {totalTasks === 0 && (
                        <div
                            style={{ backgroundColor: "var(--color-secondary-dark)", opacity: 0.3 }}
                            className="w-full h-full rounded-sm"
                        />
                    )}
                </div>

                {/* 3 Status Summary Columns */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                    <div
                        style={{
                            backgroundColor: "var(--color-primary)",
                            borderColor: "var(--color-stroke)"
                        }}
                        className="p-2.5 rounded-xl border flex flex-col gap-0.5"
                    >
                        <div className="flex items-center gap-1.5">
                            <CircleDashed className="w-3.5 h-3.5 text-[var(--color-orange)]" />
                            <span
                                style={{ color: "var(--color-secondary-dark)" }}
                                className="text-[11px] font-medium"
                            >
                                Backlog / To Do
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                            <span
                                style={{ color: "var(--foreground)" }}
                                className="text-base font-extrabold"
                            >
                                {todo}
                            </span>
                            <span
                                style={{ color: "var(--color-secondary-dark)" }}
                                className="text-[10px] font-mono"
                            >
                                {todoPct}%
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: "var(--color-primary)",
                            borderColor: "var(--color-stroke)"
                        }}
                        className="p-2.5 rounded-xl border flex flex-col gap-0.5"
                    >
                        <div className="flex items-center gap-1.5">
                            <Clock3 className="w-3.5 h-3.5 text-[var(--color-tertiary)]" />
                            <span
                                style={{ color: "var(--color-secondary-dark)" }}
                                className="text-[11px] font-medium"
                            >
                                In Progress
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                            <span
                                style={{ color: "var(--foreground)" }}
                                className="text-base font-extrabold"
                            >
                                {inProgress}
                            </span>
                            <span
                                style={{ color: "var(--color-secondary-dark)" }}
                                className="text-[10px] font-mono"
                            >
                                {inProgressPct}%
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: "var(--color-primary)",
                            borderColor: "var(--color-stroke)"
                        }}
                        className="p-2.5 rounded-xl border flex flex-col gap-0.5"
                    >
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />
                            <span
                                style={{ color: "var(--color-secondary-dark)" }}
                                className="text-[11px] font-medium"
                            >
                                Completed
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                            <span
                                style={{ color: "var(--foreground)" }}
                                className="text-base font-extrabold"
                            >
                                {completed}
                            </span>
                            <span
                                style={{ color: "var(--color-secondary-dark)" }}
                                className="text-[10px] font-mono"
                            >
                                {completedPct}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workload Priority Breakdown Integrated Strip */}
            <div className="pt-3 border-t border-[var(--color-stroke)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span
                        style={{ color: "var(--color-secondary-dark)" }}
                        className="font-bold text-[11px] uppercase tracking-wider"
                    >
                        Workload Priority Distribution
                    </span>
                    <span style={{ color: "var(--color-secondary-dark)" }} className="text-[11px]">
                        {totalTasks} total tasks
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {priorities.map((p) => (
                        <div
                            key={p.label}
                            style={{
                                backgroundColor: "var(--color-primary)",
                                borderColor: "var(--color-stroke)"
                            }}
                            className="p-2 rounded-xl border flex items-center justify-between text-xs"
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    style={{ backgroundColor: p.color }}
                                    className="w-2 h-2 rounded-full shrink-0"
                                />
                                <span
                                    style={{ color: "var(--foreground)" }}
                                    className="text-[11px] font-medium"
                                >
                                    {p.label}
                                </span>
                            </div>
                            <span
                                style={{ color: "var(--foreground)" }}
                                className="font-bold font-mono text-[11px]"
                            >
                                {p.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
