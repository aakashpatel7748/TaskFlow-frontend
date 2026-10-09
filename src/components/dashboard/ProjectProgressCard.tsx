"use client";

import React from "react";
import Link from "next/link";
import { FolderKanban, CheckCircle2, ArrowRight } from "lucide-react";
import { DashboardProject } from "@/types/dashboard";

interface ProjectProgressCardProps {
    project: DashboardProject;
}

export const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({ project }) => {
    const isCompleted = project.status === "Completed";
    const statusBg = isCompleted
        ? "rgba(46, 204, 113, 0.15)"
        : project.status === "In Progress"
        ? "rgba(54, 171, 249, 0.15)"
        : "rgba(255, 165, 0, 0.15)";

    const statusColor = isCompleted
        ? "var(--color-success)"
        : project.status === "In Progress"
        ? "var(--color-tertiary)"
        : "var(--color-orange)";

    const progressColor = isCompleted
        ? "var(--color-success)"
        : "var(--color-tertiary)";

    return (
        <Link
            href={`/tasks/projects/${project._id}`}
            style={{
                backgroundColor: "var(--color-primary-light)",
                borderColor: "var(--color-stroke)"
            }}
            className="group block p-4 rounded-2xl border shadow-sm hover:border-[var(--color-tertiary)] hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span
                        style={{
                            color: "var(--color-tertiary)",
                            backgroundColor: "var(--color-primary)"
                        }}
                        className="p-1 rounded-lg shrink-0"
                    >
                        <FolderKanban className="w-3.5 h-3.5" />
                    </span>
                    <span
                        style={{ color: "var(--color-secondary-dark)" }}
                        className="text-[11px] font-mono uppercase tracking-wider truncate"
                    >
                        {project.space?.name || "General"}
                    </span>
                </div>

                <span
                    style={{
                        backgroundColor: statusBg,
                        color: statusColor,
                        borderColor: statusColor
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-opacity-30 shrink-0"
                >
                    {project.status}
                </span>
            </div>

            <h4
                style={{ color: "var(--foreground)" }}
                className="text-sm font-bold truncate group-hover:text-[var(--color-tertiary)] transition-colors"
            >
                {project.name}
            </h4>

            {project.description && (
                <p
                    style={{ color: "var(--color-secondary-dark)" }}
                    className="text-xs line-clamp-1 mt-1 font-normal"
                >
                    {project.description}
                </p>
            )}

            <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                    <span style={{ color: "var(--color-secondary-dark)" }} className="font-medium">
                        Tasks: {project.completedTasks}/{project.totalTasks}
                    </span>
                    <span style={{ color: "var(--foreground)" }} className="font-bold">
                        {project.progress}%
                    </span>
                </div>

                <div
                    style={{ backgroundColor: "var(--color-primary)" }}
                    className="w-full h-1.5 rounded-full overflow-hidden"
                >
                    <div
                        style={{
                            width: `${Math.min(Math.max(project.progress, 0), 100)}%`,
                            backgroundColor: progressColor
                        }}
                        className="h-full rounded-full transition-all duration-500"
                    />
                </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--color-stroke)] flex items-center justify-between text-[11px]">
                <span style={{ color: "var(--color-secondary-dark)" }}>
                    {project.totalTasks === 0 ? "No tasks yet" : `${project.todoTasks} pending`}
                </span>
                <span
                    style={{ color: "var(--color-tertiary)" }}
                    className="font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                    Open <ArrowRight className="w-3 h-3" />
                </span>
            </div>
        </Link>
    );
};
