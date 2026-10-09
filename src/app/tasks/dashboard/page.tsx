"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    FolderKanban,
    RefreshCw,
    Sparkles,
    ArrowRight
} from "lucide-react";
import PageTitleCard from "@/components/card/PageTitleCard";
import { getAppSession } from "@/lib/session/AppSession";
import { getDashboardTasksAPI } from "@/services/opreations/dashbord";
import { DashboardData } from "@/types/dashboard";
import {
    DashboardMetricsRow,
    TaskVelocityPanel,
    UpcomingDeadlinesPanel,
    ProjectsOverviewPanel,
    RecentActivityPanel,
    DashboardSkeleton
} from "@/components/dashboard";

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [workspaceName, setWorkspaceName] = useState<string>("Workspace");
    const [userName, setUserName] = useState<string>("Team Member");

    // Fetch dashboard metrics via aggregation pipeline
    const fetchDashboardMetrics = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }

            const currentWsId =
                typeof window !== "undefined"
                    ? localStorage.getItem("selectedWorkspaceId")
                    : null;
            const currentWsName =
                typeof window !== "undefined"
                    ? localStorage.getItem("selectedWorkspace")
                    : null;

            if (currentWsName) {
                setWorkspaceName(currentWsName);
            }

            const res = await getDashboardTasksAPI().action(currentWsId);
            if (res?.data?.statusCode === 200 && res?.data?.data) {
                setDashboardData(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load dashboard metrics:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Initial load and user profile session retrieval
    useEffect(() => {
        const session = getAppSession() as any;
        if (session) {
            const name =
                session.fullName ||
                session.username ||
                (session.email ? session.email.split("@")[0] : "Team Member");
            setUserName(name);
        }

        fetchDashboardMetrics();

        // Listen for global workspace change events
        const handleWorkspaceChange = () => {
            fetchDashboardMetrics();
        };

        window.addEventListener("workspaceChanged", handleWorkspaceChange);
        return () => {
            window.removeEventListener("workspaceChanged", handleWorkspaceChange);
        };
    }, [fetchDashboardMetrics]);

    return (
        <div className="w-full space-y-6 pb-12 select-none">
            {/* Header Banner */}
            <PageTitleCard
                title={`Welcome back, ${userName}`}
                description={`${workspaceName} Overview • Live sprint execution, task throughput, and deliverable health.`}
                icon={<LayoutDashboard className="w-4 h-4 text-[var(--color-tertiary)]" />}
                action={
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => fetchDashboardMetrics(true)}
                            disabled={isRefreshing}
                            style={{
                                backgroundColor: "var(--color-primary-light)",
                                borderColor: "var(--color-stroke)",
                                color: "var(--color-secondary)"
                            }}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold hover:border-[var(--color-tertiary)] hover:text-[var(--color-tertiary)] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Refresh Dashboard"
                        >
                            <RefreshCw
                                className={`w-3.5 h-3.5 ${
                                    isRefreshing ? "animate-spin text-[var(--color-tertiary)]" : ""
                                }`}
                            />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        <Link
                            href="/tasks/projects"
                            style={{
                                backgroundColor: "var(--color-tertiary)",
                                color: "#ffffff"
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold hover:opacity-95 transition flex items-center gap-1.5 shadow-md shadow-[var(--color-tertiary-opaque)]"
                        >
                            <FolderKanban className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Project Board</span>
                        </Link>
                    </div>
                }
            />

            {/* Skeleton Loading State */}
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {/* Primary Metrics Row (4 Equal-Height Balanced KPI Cards) */}
                    {dashboardData && (
                        <DashboardMetricsRow
                            taskMetrics={dashboardData.taskMetrics}
                            projectMetrics={dashboardData.projectMetrics}
                            priorityBreakdown={dashboardData.priorityBreakdown}
                        />
                    )}

                    {/* Personal Focus Insight Bar */}
                    {dashboardData?.myTasksSummary && dashboardData.myTasksSummary.total > 0 && (
                        <div
                            style={{
                                backgroundColor: "var(--color-primary-light)",
                                borderColor: "var(--color-stroke)"
                            }}
                            className="p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                        >
                            <div className="flex items-center gap-2.5">
                                <span
                                    style={{
                                        backgroundColor: "rgba(54, 171, 249, 0.15)",
                                        color: "var(--color-tertiary)"
                                    }}
                                    className="p-2 rounded-xl"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </span>
                                <div>
                                    <p
                                        style={{ color: "var(--foreground)" }}
                                        className="text-xs font-bold"
                                    >
                                        My Focus Dashboard
                                    </p>
                                    <p
                                        style={{ color: "var(--color-secondary-dark)" }}
                                        className="text-[11px]"
                                    >
                                        You have{" "}
                                        <span className="font-semibold text-[var(--foreground)]">
                                            {dashboardData.myTasksSummary.total} assigned tasks
                                        </span>{" "}
                                        in this workspace.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span
                                    style={{
                                        backgroundColor: "var(--color-primary)",
                                        color: "var(--color-success)"
                                    }}
                                    className="px-2.5 py-1 rounded-lg font-semibold"
                                >
                                    {dashboardData.myTasksSummary.completed} Completed
                                </span>
                                <span
                                    style={{
                                        backgroundColor: "var(--color-primary)",
                                        color: "var(--color-tertiary)"
                                    }}
                                    className="px-2.5 py-1 rounded-lg font-semibold"
                                >
                                    {dashboardData.myTasksSummary.inProgress} In Progress
                                </span>
                                {dashboardData.myTasksSummary.overdue > 0 && (
                                    <span
                                        style={{
                                            backgroundColor: "rgba(231, 76, 60, 0.15)",
                                            color: "var(--color-error)"
                                        }}
                                        className="px-2.5 py-1 rounded-lg font-bold"
                                    >
                                        {dashboardData.myTasksSummary.overdue} Overdue
                                    </span>
                                )}
                                <Link
                                    href="/tasks/my-tasks"
                                    style={{ color: "var(--color-tertiary)" }}
                                    className="ml-auto sm:ml-2 font-bold hover:underline flex items-center gap-1"
                                >
                                    Go to My Tasks <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Execution Analytics & Deadlines (Balanced 2-Column Row) */}
                    {dashboardData && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                            <div className="lg:col-span-7">
                                <TaskVelocityPanel
                                    statusBreakdown={dashboardData.statusBreakdown}
                                    priorityBreakdown={dashboardData.priorityBreakdown}
                                    totalTasks={dashboardData.taskMetrics.total}
                                />
                            </div>
                            <div className="lg:col-span-5">
                                <UpcomingDeadlinesPanel
                                    deadlines={dashboardData.upcomingDeadlines}
                                />
                            </div>
                        </div>
                    )}

                    {/* Section 2: Projects Overview & Activity Feed (Balanced 2-Column Row) */}
                    {dashboardData && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                            <div className="lg:col-span-7">
                                <ProjectsOverviewPanel projects={dashboardData.projects} />
                            </div>
                            <div className="lg:col-span-5">
                                <RecentActivityPanel tasks={dashboardData.recentTasks} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
