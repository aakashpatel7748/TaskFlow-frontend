"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, Clock3, CircleDashed, CheckCircle2, User, ArrowRight } from "lucide-react";
import { DashboardTask } from "@/types/dashboard";

interface RecentTasksWidgetProps {
    tasks: DashboardTask[];
}

export const RecentTasksWidget: React.FC<RecentTasksWidgetProps> = ({ tasks }) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />;
            case "in-progress":
                return <Clock3 className="w-3.5 h-3.5 text-[var(--color-tertiary)]" />;
            default:
                return <CircleDashed className="w-3.5 h-3.5 text-[var(--color-orange)]" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "urgent":
                return {
                    label: "Urgent",
                    color: "var(--color-error)",
                    bg: "rgba(231, 76, 60, 0.15)"
                };
            case "high":
                return {
                    label: "High",
                    color: "var(--color-orange)",
                    bg: "rgba(255, 165, 0, 0.15)"
                };
            case "medium":
                return {
                    label: "Medium",
                    color: "var(--color-tertiary)",
                    bg: "rgba(54, 171, 249, 0.15)"
                };
            default:
                return {
                    label: "Low",
                    color: "var(--color-secondary-dark)",
                    bg: "rgba(158, 154, 209, 0.15)"
                };
        }
    };

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
                        Recent Activity & Tasks
                    </h3>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-xs">
                        Latest updates across workspace
                    </p>
                </div>
                <Link
                    href="/tasks/my-tasks"
                    style={{ color: "var(--color-tertiary)" }}
                    className="text-xs font-semibold hover:underline flex items-center gap-1"
                >
                    View all <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {tasks.length === 0 ? (
                <div
                    style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="p-6 rounded-xl border text-center space-y-2"
                >
                    <CheckSquare className="w-6 h-6 mx-auto text-[var(--color-secondary-dark)]" />
                    <p style={{ color: "var(--foreground)" }} className="text-xs font-semibold">
                        No recent tasks
                    </p>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-[11px]">
                        Create your first task to start tracking velocity.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-[var(--color-stroke)]">
                    {tasks.map((task) => {
                        const prio = getPriorityBadge(task.priority);
                        return (
                            <div
                                key={task._id}
                                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-[var(--color-primary)] p-1.5 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="shrink-0">{getStatusIcon(task.status)}</span>
                                    <div className="min-w-0">
                                        <p
                                            style={{ color: "var(--foreground)" }}
                                            className="text-xs font-semibold truncate"
                                        >
                                            {task.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {task.project?.name && (
                                                <span
                                                    style={{ color: "var(--color-secondary-dark)" }}
                                                    className="text-[10px] font-mono truncate max-w-[120px]"
                                                >
                                                    {task.project.name}
                                                </span>
                                            )}
                                            {task.assignee?.fullName && (
                                                <span
                                                    style={{ color: "var(--color-secondary-dark)" }}
                                                    className="text-[10px] flex items-center gap-1 truncate"
                                                >
                                                    <User className="w-2.5 h-2.5" />
                                                    {task.assignee.fullName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span
                                        style={{
                                            backgroundColor: prio.bg,
                                            color: prio.color
                                        }}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                                    >
                                        {prio.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
