"use client";

import React from "react";
import Link from "next/link";
import { FolderKanban, ArrowRight, Plus, FolderGit2 } from "lucide-react";
import { DashboardProject } from "@/types/dashboard";

interface ProjectsOverviewPanelProps {
    projects: DashboardProject[];
}

export const ProjectsOverviewPanel: React.FC<ProjectsOverviewPanelProps> = ({ projects }) => {
    return (
        <div
            style={{
                backgroundColor: "var(--color-primary-light)",
                borderColor: "var(--color-stroke)"
            }}
            className="p-5 rounded-2xl border shadow-sm space-y-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div
                        style={{
                            backgroundColor: "var(--color-primary)",
                            borderColor: "var(--color-stroke)",
                            color: "var(--color-tertiary)"
                        }}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                    >
                        <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                        <h3
                            style={{ color: "var(--foreground)" }}
                            className="text-sm font-bold tracking-tight"
                        >
                            Active Workspace Projects
                        </h3>
                        <p style={{ color: "var(--color-secondary-dark)" }} className="text-xs">
                            Initiatives and sprint delivery health
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/tasks/projects"
                        style={{ color: "var(--color-tertiary)" }}
                        className="text-xs font-semibold hover:underline flex items-center gap-1"
                    >
                        View all ({projects.length}) <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Content List */}
            {projects.length === 0 ? (
                <div
                    style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="p-8 rounded-xl border text-center space-y-3"
                >
                    <FolderKanban className="w-8 h-8 mx-auto text-[var(--color-secondary-dark)]" />
                    <p style={{ color: "var(--foreground)" }} className="text-xs font-bold">
                        No projects in this workspace yet
                    </p>
                    <p
                        style={{ color: "var(--color-secondary-dark)" }}
                        className="text-[11px] max-w-sm mx-auto"
                    >
                        Create your first project to organize tasks and track deliverables.
                    </p>
                    <Link
                        href="/tasks/projects"
                        style={{
                            backgroundColor: "var(--color-tertiary)",
                            color: "#ffffff"
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold mt-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> New Project
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-[var(--color-stroke)]">
                    {projects.slice(0, 5).map((project) => {
                        const isCompleted = project.status === "Completed";
                        const statusColor = isCompleted
                            ? "var(--color-success)"
                            : project.status === "In Progress"
                            ? "var(--color-tertiary)"
                            : "var(--color-orange)";

                        const statusBg = isCompleted
                            ? "rgba(46, 204, 113, 0.12)"
                            : project.status === "In Progress"
                            ? "rgba(54, 171, 249, 0.12)"
                            : "rgba(255, 165, 0, 0.12)";

                        return (
                            <Link
                                key={project._id}
                                href={`/tasks/projects/${project._id}`}
                                className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[var(--color-primary)] p-2 rounded-xl transition-all"
                            >
                                <div className="space-y-1 min-w-0 sm:max-w-[45%]">
                                    <div className="flex items-center gap-2">
                                        <h4
                                            style={{ color: "var(--foreground)" }}
                                            className="text-xs font-bold truncate group-hover:text-[var(--color-tertiary)] transition-colors"
                                        >
                                            {project.name}
                                        </h4>
                                        <span
                                            style={{
                                                backgroundColor: statusBg,
                                                color: statusColor
                                            }}
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono"
                                        >
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px]">
                                        <span
                                            style={{ color: "var(--color-secondary-dark)" }}
                                            className="flex items-center gap-1 font-mono uppercase"
                                        >
                                            <FolderGit2 className="w-3 h-3 text-[var(--color-tertiary)]" />
                                            {project.space?.name || "General"}
                                        </span>
                                        {project.description && (
                                            <span
                                                style={{ color: "var(--color-secondary-dark)" }}
                                                className="truncate hidden md:inline"
                                            >
                                                • {project.description}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:w-56 shrink-0 justify-between sm:justify-end">
                                    <div className="w-32 space-y-1">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span style={{ color: "var(--color-secondary-dark)" }}>
                                                {project.completedTasks}/{project.totalTasks} tasks
                                            </span>
                                            <span
                                                style={{ color: "var(--foreground)" }}
                                                className="font-bold font-mono"
                                            >
                                                {project.progress}%
                                            </span>
                                        </div>
                                        <div
                                            style={{ backgroundColor: "var(--color-primary)" }}
                                            className="w-full h-1.5 rounded-full overflow-hidden"
                                        >
                                            <div
                                                style={{
                                                    width: `${Math.min(
                                                        Math.max(project.progress, 0),
                                                        100
                                                    )}%`,
                                                    backgroundColor: statusColor
                                                }}
                                                className="h-full rounded-full transition-all duration-500"
                                            />
                                        </div>
                                    </div>

                                    <span
                                        style={{ color: "var(--color-tertiary)" }}
                                        className="text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0"
                                    >
                                        Open <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
