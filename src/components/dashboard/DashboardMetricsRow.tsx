"use client";

import React from "react";
import { FolderKanban, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { TaskMetrics, ProjectMetrics, PriorityBreakdown } from "@/types/dashboard";

interface DashboardMetricsRowProps {
    taskMetrics: TaskMetrics;
    projectMetrics: ProjectMetrics;
    priorityBreakdown: PriorityBreakdown;
}

export const DashboardMetricsRow: React.FC<DashboardMetricsRowProps> = ({
    taskMetrics,
    projectMetrics,
    priorityBreakdown
}) => {
    const cards = [
        {
            id: "projects",
            title: "Total Projects",
            value: projectMetrics.total,
            meta: `${projectMetrics.completed} completed • ${projectMetrics.inProgress} active`,
            icon: FolderKanban,
            accent: "var(--color-tertiary)",
            progress: projectMetrics.completionRate,
            progressLabel: `${projectMetrics.completionRate}% completion`
        },
        {
            id: "tasks",
            title: "Total Tasks",
            value: taskMetrics.total,
            meta: `${taskMetrics.completed} resolved • ${taskMetrics.todo} backlog`,
            icon: CheckSquare,
            accent: "var(--color-success)",
            progress: taskMetrics.completionRate,
            progressLabel: `${taskMetrics.completionRate}% completed`
        },
        {
            id: "in_progress",
            title: "Active In-Progress",
            value: taskMetrics.inProgress,
            meta: "Tasks currently being worked on",
            icon: Clock,
            accent: "var(--color-blue)",
            progress:
                taskMetrics.total > 0
                    ? Math.round((taskMetrics.inProgress / taskMetrics.total) * 100)
                    : 0,
            progressLabel: "Active workload"
        },
        {
            id: "attention",
            title: "Attention Needed",
            value: taskMetrics.overdue + (priorityBreakdown.urgent || 0),
            meta: `${taskMetrics.overdue} overdue • ${priorityBreakdown.urgent || 0} urgent priority`,
            icon: AlertTriangle,
            accent:
                taskMetrics.overdue > 0 || (priorityBreakdown.urgent || 0) > 0
                    ? "var(--color-error)"
                    : "var(--color-success)",
            progress:
                taskMetrics.total > 0
                    ? Math.round(
                          ((taskMetrics.overdue + (priorityBreakdown.urgent || 0)) /
                              taskMetrics.total) *
                              100
                      )
                    : 0,
            progressLabel: taskMetrics.overdue > 0 ? "Requires review" : "On schedule"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {cards.map((card) => {
                const IconComponent = card.icon;
                return (
                    <div
                        key={card.id}
                        style={{
                            backgroundColor: "var(--color-primary-light)",
                            borderColor: "var(--color-stroke)"
                        }}
                        className="p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all duration-200 hover:border-[var(--color-tertiary)]"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    style={{ color: "var(--color-secondary-dark)" }}
                                    className="text-[11px] font-bold uppercase tracking-wider truncate"
                                >
                                    {card.title}
                                </span>
                                <div
                                    style={{
                                        backgroundColor: "var(--color-primary)",
                                        borderColor: "var(--color-stroke)",
                                        color: card.accent
                                    }}
                                    className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                                >
                                    <IconComponent className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="mt-2 flex items-baseline gap-2">
                                <span
                                    style={{ color: "var(--foreground)" }}
                                    className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                                >
                                    {card.value}
                                </span>
                            </div>

                            <p
                                style={{ color: "var(--color-secondary-dark)" }}
                                className="text-[11px] font-medium mt-1 truncate"
                            >
                                {card.meta}
                            </p>
                        </div>

                        {/* Cohesive Progress Line */}
                        <div className="mt-3.5 pt-2.5 border-t border-[var(--color-stroke)] space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                                <span
                                    style={{ color: "var(--color-secondary-dark)" }}
                                    className="font-medium"
                                >
                                    {card.progressLabel}
                                </span>
                                <span
                                    style={{ color: "var(--color-secondary)" }}
                                    className="font-bold font-mono"
                                >
                                    {card.progress}%
                                </span>
                            </div>
                            <div
                                style={{ backgroundColor: "var(--color-primary)" }}
                                className="w-full h-1.5 rounded-full overflow-hidden"
                            >
                                <div
                                    style={{
                                        width: `${Math.min(Math.max(card.progress, 0), 100)}%`,
                                        backgroundColor: card.accent
                                    }}
                                    className="h-full rounded-full transition-all duration-500"
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
