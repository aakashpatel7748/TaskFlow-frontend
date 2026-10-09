"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, Clock3, CircleDashed, CheckCircle2, User, ArrowRight } from "lucide-react";
import { DashboardTask } from "@/types/dashboard";

interface RecentActivityPanelProps {
    tasks: DashboardTask[];
}

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({ tasks }) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />;
            case "in-progress":
                return <Clock3 className="w-3.5 h-3.5 text-[var(--color-tertiary)] shrink-0" />;
            default:
                return <CircleDashed className="w-3.5 h-3.5 text-[var(--color-orange)] shrink-0" />;
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
            className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3
                        style={{ color: "var(--foreground)" }}
                        className="text-sm font-bold tracking-tight"
                    >
                        Recent Activity Log
                    </h3>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-xs">
                        Latest task movements in workspace
                    </p>
                </div>
                <Link
                    href="/tasks/my-tasks"
                    style={{ color: "var(--color-tertiary)" }}
                    className="text-xs font-semibold hover:underline flex items-center gap-1"
                >
                    My Tasks <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {/* List */}
            {tasks.length === 0 ? (
                <div
                    style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="p-6 rounded-xl border text-center space-y-2 my-auto"
                >
                    <CheckSquare className="w-6 h-6 mx-auto text-[var(--color-secondary-dark)]" />
                    <p style={{ color: "var(--foreground)" }} className="text-xs font-semibold">
                        No recent activity
                    </p>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-[11px]">
                        Task updates will be streamed here.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-[var(--color-stroke)]">
                    {tasks.slice(0, 5).map((task) => {
                        const prio = getPriorityBadge(task.priority);
                        return (
                            <div
                                key={task._id}
                                className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-[var(--color-primary)] p-1.5 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {getStatusIcon(task.status)}
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

                                <span
                                    style={{
                                        backgroundColor: prio.bg,
                                        color: prio.color
                                    }}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 font-mono"
                                >
                                    {prio.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-[var(--color-stroke)] flex items-center justify-between text-xs">
                <span style={{ color: "var(--color-secondary-dark)" }}>
                    Showing latest {Math.min(tasks.length, 5)} updates
                </span>
                <Link
                    href="/tasks/projects"
                    style={{ color: "var(--color-tertiary)" }}
                    className="font-bold hover:underline"
                >
                    Workspace Board →
                </Link>
            </div>
        </div>
    );
};
