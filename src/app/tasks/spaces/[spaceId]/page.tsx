"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Layers,
    FolderKanban,
    Plus,
    Search,
    RefreshCw,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    User,
    CheckCircle2,
    FolderGit2,
    List,
    LayoutGrid,
    Building2,
    Hash,
    Pencil,
    Trash2,
    AlertTriangle,
    Eye,
    Clock,
    Lock,
    Globe,
    CheckSquare2,
    BarChart3,
    Copy,
    Check,
    Settings,
    Activity,
    FolderPlus
} from "lucide-react";
import { getSpaceByIdAPI, getSpaceAPI, updateSpaceAPI, deleteSpaceAPI } from "@/services/opreations/space";
import { getAllProjectsAPI, createProjectAPI } from "@/services/opreations/project";
import { getTasksAPI } from "@/services/opreations/tasks";
import TanStackTable, { features } from "@/components/table/TanStackTable";
import type { ColumnDef } from "@tanstack/react-table";
import PopupModel from "@/components/tasks/PopupModel";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";

const PRESET_COLORS = [
    { name: "Violet", hex: "#6366f1" },
    { name: "Indigo", hex: "#4f46e5" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Sky", hex: "#0ea5e9" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Purple", hex: "#a855f7" },
];

export default function DedicatedSpacePage() {
    const params = useParams<{ spaceId: string }>();
    const router = useRouter();
    const spaceId = params?.spaceId;

    const [space, setSpace] = useState<any | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<boolean>(false);

    // Active sub-tab
    const [activeTab, setActiveTab] = useState<"OVERVIEW" | "PROJECTS" | "TASKS" | "SETTINGS">("OVERVIEW");

    // Projects view mode inside this space
    const [projectsViewMode, setProjectsViewMode] = useState<"GRID" | "TABLE">("GRID");
    const [projectSearchQuery, setProjectSearchQuery] = useState<string>("");

    // Task search & filter
    const [taskSearchQuery, setTaskSearchQuery] = useState<string>("");
    const [taskStatusFilter, setTaskStatusFilter] = useState<string>("ALL");

    // Edit Space Modal
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    // Delete Space Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Create Project inside this space Modal
    const [createProjectModalOpen, setCreateProjectModalOpen] = useState<boolean>(false);
    const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);

    // Forms
    const editForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            icon: "Layers",
            color: "#6366f1",
        },
    });

    const createProjectForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            isPrivate: false,
        },
    });

    // Load active workspace
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedWs = localStorage.getItem("selectedWorkspaceId");
            if (savedWs) {
                setWorkspaceId(savedWs);
            }
        }
    }, []);

    // Main fetch data
    const fetchSpaceData = useCallback(async () => {
        if (!spaceId) {
            setLoading(false);
            return;
        }

        const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);

        try {
            setLoading(true);
            let spaceData: any = null;

            // 1. Try dedicated single-space endpoint
            try {
                const res = await getSpaceByIdAPI().action(spaceId);
                if (res?.data?.data) {
                    spaceData = res.data.data;
                }
            } catch (singleErr) {
                // 2. Fallback: query from workspace spaces list
                if (activeWs) {
                    const listRes = await getSpaceAPI().action(activeWs).catch(() => null);
                    if (listRes?.data?.data && Array.isArray(listRes.data.data)) {
                        spaceData = listRes.data.data.find((s: any) => s._id === spaceId);
                    }
                }
            }

            if (spaceData) {
                setSpace(spaceData);
                editForm.reset({
                    name: spaceData.name || "",
                    description: spaceData.description || "",
                    icon: spaceData.icon || "Layers",
                    color: spaceData.color || "#6366f1",
                });
            }

            // 3. Fetch projects belonging to this space
            const [projectsRes, tasksRes] = await Promise.all([
                getAllProjectsAPI().action(activeWs, spaceId).catch(() => null),
                getTasksAPI().action(undefined, activeWs || undefined).catch(() => null)
            ]);

            if (projectsRes?.data?.data) {
                setProjects(projectsRes.data.data);
            }

            if (tasksRes?.data?.data) {
                setAllTasks(tasksRes.data.data);
            }
        } catch (error) {
            console.error("Error loading space data:", error);
        } finally {
            setLoading(false);
        }
    }, [spaceId, workspaceId, editForm]);

    useEffect(() => {
        fetchSpaceData();
    }, [fetchSpaceData]);

    // Handle Refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchSpaceData();
        setIsRefreshing(false);
        toast.add({
            title: "Space Refreshed",
            description: "Space and linked projects updated",
        });
    };

    // Filter tasks belonging to this space's projects
    const spaceTasks = useMemo(() => {
        const projectIds = new Set(projects.map((p) => p._id));
        return allTasks.filter((t) => {
            const pId = typeof t.projectId === "object" ? t.projectId?._id : t.projectId;
            return projectIds.has(pId);
        });
    }, [allTasks, projects]);

    // Derived stats
    const stats = useMemo(() => {
        const totalProjects = projects.length;
        const totalTasks = spaceTasks.length;
        const completedTasks = spaceTasks.filter((t) => {
            const s = (t.status || "").toLowerCase();
            return s === "completed" || s === "done";
        }).length;
        const inProgressTasks = spaceTasks.filter((t) => {
            const s = (t.status || "").toLowerCase();
            return s === "in-progress" || s === "in_progress";
        }).length;
        const todoTasks = totalTasks - completedTasks - inProgressTasks;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalProjects,
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            completionRate,
        };
    }, [projects, spaceTasks]);

    // Copy Space ID
    const handleCopyId = () => {
        if (!spaceId) return;
        navigator.clipboard.writeText(spaceId);
        setCopiedId(true);
        toast.add({
            title: "Copied",
            description: "Space ID copied to clipboard",
        });
        setTimeout(() => setCopiedId(false), 2000);
    };

    // Update Space
    const onSubmitUpdateSpace = async (data: any) => {
        if (!spaceId) return;
        if (!data.name.trim()) {
            toast.add({
                title: "Name Required",
                description: "Space name is required",
            });
            return;
        }

        try {
            setIsUpdating(true);
            const payload = {
                name: data.name.trim(),
                description: data.description,
                icon: data.icon,
                color: data.color || "#6366f1",
            };

            const res = await updateSpaceAPI().action(spaceId, payload);
            if (res?.status === 200 || res?.status === 201) {
                const updatedSpace = res.data?.data || { ...space, ...payload };
                setSpace(updatedSpace);
                toast.add({
                    title: "Space Updated",
                    description: `Space "${data.name}" updated successfully!`,
                });
                setEditModalOpen(false);
            }
        } catch (error: any) {
            console.error("Update space error:", error);
            toast.add({
                title: "Update Failed",
                description: error?.response?.data?.message || "Could not update space",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete Space
    const onConfirmDeleteSpace = async () => {
        if (!spaceId) return;
        try {
            setIsDeleting(true);
            const res = await deleteSpaceAPI().action(spaceId);
            if (res?.status === 200 || res?.status === 204) {
                toast.add({
                    title: "Space Deleted",
                    description: `Space "${space?.name || "Space"}" deleted successfully`,
                });
                setDeleteModalOpen(false);
                router.push("/tasks/spaces");
            }
        } catch (error: any) {
            console.error("Delete space error:", error);
            toast.add({
                title: "Delete Failed",
                description: error?.response?.data?.message || "Could not delete space",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Create Project inside Space
    const onSubmitCreateProject = async (data: any) => {
        const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
        if (!activeWs) {
            toast.add({
                title: "Creation Error",
                description: "No active workspace selected",
            });
            return;
        }

        if (!data.name.trim()) {
            toast.add({
                title: "Name Required",
                description: "Please enter a project name",
            });
            return;
        }

        try {
            setIsCreatingProject(true);
            const payload = {
                name: data.name.trim(),
                description: data.description || "",
                isPrivate: Boolean(data.isPrivate),
                spaceId: spaceId as string,
                workspaceId: activeWs,
            };

            const res = await createProjectAPI().action(payload);
            if (res?.status === 200 || res?.status === 201) {
                toast.add({
                    title: "Project Created",
                    description: `Project "${data.name}" added to this space!`,
                });
                setCreateProjectModalOpen(false);
                createProjectForm.reset();
                fetchSpaceData();
            }
        } catch (error: any) {
            console.error("Create project error:", error);
            toast.add({
                title: "Creation Failed",
                description: error?.response?.data?.message || "Could not create project",
            });
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Filtered Projects
    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            const query = projectSearchQuery.toLowerCase();
            return (
                !query ||
                p.name?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        });
    }, [projects, projectSearchQuery]);

    // Filtered Tasks
    const filteredTasks = useMemo(() => {
        return spaceTasks.filter((t) => {
            const query = taskSearchQuery.toLowerCase();
            const matchesQuery = !query || t.name?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query);

            if (taskStatusFilter === "ALL") return matchesQuery;
            const status = (t.status || "").toLowerCase();
            if (taskStatusFilter === "COMPLETED") return matchesQuery && (status === "completed" || status === "done");
            if (taskStatusFilter === "IN_PROGRESS") return matchesQuery && (status === "in-progress" || status === "in_progress");
            if (taskStatusFilter === "TODO") return matchesQuery && status !== "completed" && status !== "done" && status !== "in-progress" && status !== "in_progress";
            return matchesQuery;
        });
    }, [spaceTasks, taskSearchQuery, taskStatusFilter]);

    // Projects Table Column Definitions
    const projectColumns = useMemo<Array<ColumnDef<typeof features, any>>>(() => [
        {
            id: "name",
            header: "Project Name & Overview",
            accessorFn: (row) => row.name,
            cell: (info) => {
                const proj = info.row.original;
                return (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/25 shrink-0 mt-0.5">
                            <FolderKanban className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white group-hover:text-indigo-300 transition-colors text-xs">
                                {proj.name}
                            </p>
                            {proj.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                                    {proj.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "privacy",
            header: "Visibility",
            accessorFn: (row) => row.isPrivate,
            cell: (info) => {
                const isPrivate = info.row.original.isPrivate;
                return isPrivate ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                        <Lock className="w-2.5 h-2.5" />
                        Private
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                        <Globe className="w-2.5 h-2.5" />
                        Public
                    </span>
                );
            },
        },
        {
            id: "createdBy",
            header: "Owner",
            accessorFn: (row) => row.createdBy?.fullName || row.createdBy?.username || "Admin",
            cell: (info) => {
                const createdBy = info.row.original.createdBy;
                const name = createdBy?.fullName || createdBy?.username || "Admin";
                return (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        {createdBy?.avatar ? (
                            <img src={createdBy.avatar} alt={name} className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[9px] font-bold">
                                {name.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <span>{name}</span>
                    </div>
                );
            },
        },
        {
            id: "createdAt",
            header: "Created",
            accessorFn: (row) => row.createdAt,
            cell: (info) => {
                const d = info.row.original.createdAt ? new Date(info.row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";
                return <span className="text-xs text-slate-400 font-mono">{d}</span>;
            },
        },
        {
            id: "action",
            header: () => <div className="text-right">Action</div>,
            cell: (info) => {
                const proj = info.row.original;
                return (
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={() => router.push(`/tasks/projects/${proj._id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium"
                        >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                );
            },
        },
    ], [router]);

    // Loading Screen
    if (loading && !space) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6 select-none animate-pulse">
                <div className="h-6 w-32 bg-slate-800 rounded-lg"></div>
                <div className="h-44 bg-[#2b2c47]/50 rounded-2xl border border-slate-800"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-900/60 rounded-xl border border-slate-800"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Space Not Found
    if (!space && !loading) {
        return (
            <div className="p-8 max-w-xl mx-auto my-12 text-center space-y-4 rounded-3xl bg-[var(--card)] border border-[var(--border)]/60">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-white">Space Not Found</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                    The space you are trying to view does not exist or may have been deleted.
                </p>
                <button
                    type="button"
                    onClick={() => router.push("/tasks/spaces")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Spaces Directory</span>
                </button>
            </div>
        );
    }

    const createdByName = space?.createdBy?.fullName || space?.createdBy?.username || "Workspace Admin";
    const spaceColor = space?.color || "#6366f1";
    const spaceCreatedDate = space?.createdAt
        ? new Date(space.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "Active";

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 select-none text-[var(--foreground)] pb-20">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <button
                        type="button"
                        onClick={() => router.push("/tasks/spaces")}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25253d] hover:bg-[#1f1f33] text-slate-300 hover:text-white border border-[#4a4978]/60 transition cursor-pointer font-medium"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Spaces Directory</span>
                    </button>
                    <span className="text-slate-600">/</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                        {space?.name || "Space"}
                    </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="p-2 rounded-xl bg-[#25253d] hover:bg-[#1f1f33] text-slate-300 hover:text-white border border-[#4a4978]/70 text-xs font-medium transition cursor-pointer"
                        title="Refresh Space Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setEditModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25253d] hover:bg-violet-600/20 text-slate-200 hover:text-violet-300 border border-[#4a4978]/70 text-xs font-semibold transition cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5 text-violet-400" />
                        <span>Edit Space</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDeleteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25253d] hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-[#4a4978]/70 text-xs font-semibold transition cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete Space</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCreateProjectModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Project</span>
                    </button>
                </div>
            </div>

            {/* Space Hero Banner */}
            <div className="relative rounded-3xl p-6 bg-gradient-to-r from-[#2b2c47] via-[#353456] to-[#25253d] border border-[#4a4978]/60 shadow-2xl overflow-hidden">
                {/* Theme top accent line */}
                <div
                    className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${spaceColor}, transparent)`
                    }}
                ></div>

                {/* Soft ambient theme glow */}
                <div
                    className="absolute -right-12 -top-12 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ backgroundColor: spaceColor }}
                ></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                        {/* Space Icon & Color Box */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg shrink-0 transition-transform group-hover:scale-105"
                            style={{
                                backgroundColor: `${spaceColor}20`,
                                borderColor: `${spaceColor}50`,
                                color: spaceColor
                            }}
                        >
                            <Layers className="w-7 h-7" />
                        </div>

                        <div className="space-y-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {space?.name}
                                </h1>
                                {space?.icon && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#25253d] text-slate-300 font-mono border border-[#4a4978]/70">
                                        {space.icon}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Active Space
                                </span>
                            </div>

                            <p className="text-xs text-[#c7c4e9]/90 max-w-2xl leading-relaxed">
                                {space?.description || "Organizational department space housing initiatives, projects, and active tasks."}
                            </p>

                            {/* Metadata Pills */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    {space?.createdBy?.avatar ? (
                                        <img
                                            src={space.createdBy.avatar}
                                            alt={createdByName}
                                            className="w-4 h-4 rounded-full object-cover border border-slate-700"
                                        />
                                    ) : (
                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                    <span className="text-slate-300">{createdByName}</span>
                                </div>

                                <span className="text-slate-600">•</span>

                                <div className="flex items-center gap-1.5 font-mono text-slate-400">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Created {spaceCreatedDate}</span>
                                </div>

                                <span className="text-slate-600">•</span>

                                <button
                                    type="button"
                                    onClick={handleCopyId}
                                    className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-slate-200 bg-[#25253d]/80 px-2 py-0.5 rounded-md border border-[#4a4978]/50 transition cursor-pointer"
                                    title="Copy Space ID"
                                >
                                    <Hash className="w-3 h-3 text-slate-500" />
                                    <span>{spaceId?.slice(0, 8)}...</span>
                                    {copiedId ? (
                                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-2.5 h-2.5 text-slate-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Badge */}
                    <div className="p-4 rounded-2xl bg-[#25253d]/80 border border-[#4a4978]/60 min-w-[180px] space-y-2 shrink-0">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Task Velocity</span>
                            <span className="font-bold text-violet-400">{stats.completionRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${stats.completionRate}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{stats.completedTasks} Done</span>
                            <span>{stats.totalTasks} Total Tasks</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Projects</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-white">{stats.totalProjects}</span>
                        <FolderGit2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Initiatives in space</p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tasks</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-indigo-400">{stats.totalTasks}</span>
                        <CheckSquare2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Tasks across projects</p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-amber-400">{stats.inProgressTasks}</span>
                        <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Currently active</p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed Tasks</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-emerald-400">{stats.completedTasks}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">{stats.completionRate}% completion rate</p>
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center justify-between border-b border-[#4a4978]/40 pb-2">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("OVERVIEW")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${activeTab === "OVERVIEW"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                : "text-slate-400 hover:text-slate-200 hover:bg-[#25253d]"
                            }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Overview</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("PROJECTS")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${activeTab === "PROJECTS"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                : "text-slate-400 hover:text-slate-200 hover:bg-[#25253d]"
                            }`}
                    >
                        <FolderKanban className="w-3.5 h-3.5" />
                        <span>Projects</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
                            {projects.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("TASKS")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${activeTab === "TASKS"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                : "text-slate-400 hover:text-slate-200 hover:bg-[#25253d]"
                            }`}
                    >
                        <CheckSquare2 className="w-3.5 h-3.5" />
                        <span>Tasks</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
                            {spaceTasks.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("SETTINGS")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${activeTab === "SETTINGS"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                : "text-slate-400 hover:text-slate-200 hover:bg-[#25253d]"
                            }`}
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Space Settings</span>
                    </button>
                </div>
            </div>

            {/* TAB CONTENT 1: OVERVIEW */}
            {activeTab === "OVERVIEW" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Space Overview & Projects Snapshot */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Projects in Space Section */}
                        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <FolderKanban className="w-4 h-4 text-violet-400" />
                                        Projects in this Space
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Active workstreams under {space?.name}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCreateProjectModalOpen(true)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-medium border border-violet-500/30 transition cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Project</span>
                                </button>
                            </div>

                            {projects.length === 0 ? (
                                <div className="p-8 text-center rounded-2xl bg-[#25253d]/50 border border-[#4a4978]/40 space-y-3">
                                    <FolderPlus className="w-8 h-8 mx-auto text-slate-500" />
                                    <p className="text-xs text-slate-300 font-semibold">No projects in this space yet</p>
                                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                                        Create your first project under this space to start organizing tasks and tracking progress.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setCreateProjectModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Create Project</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {projects.slice(0, 4).map((p) => (
                                        <div
                                            key={p._id}
                                            onClick={() => router.push(`/tasks/projects/${p._id}`)}
                                            className="p-4 rounded-2xl bg-[#25253d]/60 hover:bg-[#25253d] border border-[#4a4978]/50 hover:border-violet-500/50 transition cursor-pointer group space-y-3 flex flex-col justify-between"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-white group-hover:text-violet-300 transition truncate max-w-[180px]">
                                                        {p.name}
                                                    </span>
                                                    {p.isPrivate ? (
                                                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                                                            <Lock className="w-2.5 h-2.5" />
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                                            <Globe className="w-2.5 h-2.5" />
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                                    {p.description || "No project description provided."}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                                                <span>{new Date(p.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                                <div className="flex items-center gap-1 text-violet-400 font-semibold group-hover:translate-x-1 transition-transform">
                                                    <span>Open</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {projects.length > 4 && (
                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("PROJECTS")}
                                        className="text-xs text-violet-400 hover:text-violet-300 font-medium transition cursor-pointer"
                                    >
                                        View all {projects.length} projects →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Tasks in Space */}
                        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <CheckSquare2 className="w-4 h-4 text-indigo-400" />
                                        Recent Space Tasks
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Tasks assigned across projects in this space
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("TASKS")}
                                    className="text-xs text-violet-400 hover:text-violet-300 font-medium transition cursor-pointer"
                                >
                                    View All Tasks →
                                </button>
                            </div>

                            {spaceTasks.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400 rounded-2xl bg-[#25253d]/50 border border-[#4a4978]/40">
                                    No tasks recorded in this space yet. Tasks created in projects belonging to this space will appear here.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {spaceTasks.slice(0, 5).map((t) => {
                                        const status = (t.status || "").toLowerCase();
                                        const isCompleted = status === "completed" || status === "done";
                                        const isInProgress = status === "in-progress" || status === "in_progress";

                                        return (
                                            <div
                                                key={t._id || t.id}
                                                className="p-3 rounded-xl bg-[#25253d]/60 border border-[#4a4978]/40 flex items-center justify-between gap-3 text-xs"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${isCompleted
                                                            ? "bg-emerald-400"
                                                            : isInProgress
                                                                ? "bg-violet-400"
                                                                : "bg-slate-500"
                                                        }`} />
                                                    <span className="font-semibold text-slate-200 truncate">
                                                        {t.name || t.title}
                                                    </span>
                                                    {t.priority && (
                                                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                                                            {t.priority}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompleted
                                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                            : isInProgress
                                                                ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                                                                : "bg-slate-800 text-slate-400 border border-slate-700"
                                                        }`}>
                                                        {t.status || "To Do"}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Space Profile & Quick Settings Card */}
                    <div className="space-y-6">
                        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 p-5 space-y-4 shadow-sm">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-violet-400" />
                                Space Profile
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                                    <span className="text-slate-400">Space Name</span>
                                    <span className="font-semibold text-white">{space?.name}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                                    <span className="text-slate-400">Tag / Icon</span>
                                    <span className="font-mono text-slate-300 bg-[#25253d] px-2 py-0.5 rounded">
                                        {space?.icon || "Layers"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                                    <span className="text-slate-400">Theme Color</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: spaceColor }}></span>
                                        <span className="font-mono text-[11px] text-slate-300">{spaceColor}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                                    <span className="text-slate-400">Created By</span>
                                    <span className="font-medium text-slate-200">{createdByName}</span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                                    <span className="text-slate-400">Space ID</span>
                                    <span className="font-mono text-[10px] text-slate-400 max-w-[140px] truncate">{spaceId}</span>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <span className="text-slate-400">Created Date</span>
                                    <span className="font-mono text-slate-300">{spaceCreatedDate}</span>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(true)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition cursor-pointer"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>Edit Space Details</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalOpen(true)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Space</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: PROJECTS */}
            {activeTab === "PROJECTS" && (
                <div className="space-y-4">
                    {/* Filter and View Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)]/40">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search projects in this space..."
                                value={projectSearchQuery}
                                onChange={(e) => setProjectSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#25253d] border border-[#4a4978]/60 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 p-1 bg-[#25253d] rounded-xl border border-[#4a4978]/60">
                                <button
                                    type="button"
                                    onClick={() => setProjectsViewMode("GRID")}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${projectsViewMode === "GRID"
                                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                            : "text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Cards</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProjectsViewMode("TABLE")}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${projectsViewMode === "TABLE"
                                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                            : "text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <List className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Table</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCreateProjectModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>New Project</span>
                            </button>
                        </div>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 space-y-4">
                            <FolderKanban className="w-10 h-10 mx-auto text-slate-500" />
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-white">No projects found</h3>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    {projectSearchQuery
                                        ? "No projects match your search query."
                                        : "Create your first project in this space to start organizing team tasks."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCreateProjectModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Project</span>
                            </button>
                        </div>
                    ) : projectsViewMode === "TABLE" ? (
                        <TanStackTable
                            columns={projectColumns}
                            data={filteredProjects}
                            emptyMessage="No matching projects found."
                            onRowClick={(p) => router.push(`/tasks/projects/${p._id}`)}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProjects.map((p) => {
                                const ownerName = p.createdBy?.fullName || p.createdBy?.username || "Admin";
                                return (
                                    <div
                                        key={p._id}
                                        onClick={() => router.push(`/tasks/projects/${p._id}`)}
                                        className="group rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 hover:border-violet-500/50 p-5 space-y-4 transition-all duration-300 hover:shadow-xl hover:shadow-violet-600/10 cursor-pointer flex flex-col justify-between"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/25">
                                                    <FolderKanban className="w-4 h-4" />
                                                </div>

                                                {p.isPrivate ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                                                        <Lock className="w-2.5 h-2.5" />
                                                        Private
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                                                        <Globe className="w-2.5 h-2.5" />
                                                        Public
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition truncate">
                                                    {p.name}
                                                </h4>
                                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                    {p.description || "No project description provided."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                            <span className="text-slate-400 truncate max-w-[120px]">{ownerName}</span>
                                            <div className="flex items-center gap-1 text-violet-400 font-semibold group-hover:translate-x-1 transition-transform">
                                                <span>Open</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT 3: TASKS */}
            {activeTab === "TASKS" && (
                <div className="space-y-4">
                    {/* Task Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)]/40">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tasks in this space..."
                                value={taskSearchQuery}
                                onChange={(e) => setTaskSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#25253d] border border-[#4a4978]/60 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition"
                            />
                        </div>

                        <div className="flex items-center gap-1 p-1 bg-[#25253d] rounded-xl border border-[#4a4978]/60">
                            {[
                                { id: "ALL", label: "All" },
                                { id: "TODO", label: "To Do" },
                                { id: "IN_PROGRESS", label: "In Progress" },
                                { id: "COMPLETED", label: "Completed" },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setTaskStatusFilter(f.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${taskStatusFilter === f.id
                                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                            : "text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 space-y-3">
                            <CheckSquare2 className="w-10 h-10 mx-auto text-slate-500" />
                            <h3 className="text-base font-bold text-white">No tasks match criteria</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                No tasks matching current filter or search term in this space.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {filteredTasks.map((t) => {
                                const status = (t.status || "").toLowerCase();
                                const isCompleted = status === "completed" || status === "done";
                                const isInProgress = status === "in-progress" || status === "in_progress";
                                const projectName = t.projectId?.name || "Project";

                                return (
                                    <div
                                        key={t._id || t.id}
                                        className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 hover:border-violet-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${isCompleted
                                                        ? "bg-emerald-400"
                                                        : isInProgress
                                                            ? "bg-violet-400"
                                                            : "bg-slate-500"
                                                    }`} />
                                                <h4 className="font-bold text-slate-100 truncate text-sm">
                                                    {t.name || t.title}
                                                </h4>
                                                <span className="px-2 py-0.5 rounded-md bg-[#25253d] text-indigo-300 font-mono text-[10px] border border-[#4a4978]/60">
                                                    {projectName}
                                                </span>
                                            </div>
                                            {t.description && (
                                                <p className="text-slate-400 text-xs line-clamp-1">
                                                    {t.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                                            {t.priority && (
                                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#25253d] text-slate-300 border border-[#4a4978]/50">
                                                    {t.priority}
                                                </span>
                                            )}
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isCompleted
                                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                    : isInProgress
                                                        ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                                                        : "bg-slate-800 text-slate-400 border border-slate-700"
                                                }`}>
                                                {t.status || "To Do"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT 4: SETTINGS */}
            {activeTab === "SETTINGS" && (
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Edit Form */}
                    <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 p-6 space-y-5 shadow-sm">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Pencil className="w-4 h-4 text-violet-400" />
                                Edit Space Information
                            </h3>
                            <p className="text-xs text-slate-400">
                                Update the name, tag, and purpose of this space
                            </p>
                        </div>

                        <form onSubmit={editForm.handleSubmit(onSubmitUpdateSpace)} className="space-y-4 text-xs">
                            <FieldGroup className="space-y-4">
                                <Controller
                                    name="name"
                                    control={editForm.control}
                                    rules={{ required: "Space name is required" }}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="input-label font-semibold">
                                                Space Name <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                className="input"
                                                placeholder="e.g. Engineering, Product Design, Marketing"
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="icon"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Space Tag / Icon Badge
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                className="input"
                                                placeholder="e.g. ENG, MKT, DES"
                                            />
                                        </Field>
                                    )}
                                />

                                {/* Color Picker */}
                                <Controller
                                    name="color"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Color Accent
                                            </FieldLabel>
                                            <div className="flex items-center gap-2 pt-1">
                                                {PRESET_COLORS.map((col) => (
                                                    <button
                                                        key={col.hex}
                                                        type="button"
                                                        onClick={() => field.onChange(col.hex)}
                                                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${field.value === col.hex ? "ring-2 ring-white scale-110" : "opacity-80 hover:opacity-100"
                                                            }`}
                                                        style={{ backgroundColor: col.hex }}
                                                        title={col.name}
                                                    />
                                                ))}
                                                <input
                                                    type="color"
                                                    value={field.value || "#6366f1"}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer ml-2"
                                                    title="Custom Color"
                                                />
                                            </div>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Space Description
                                            </FieldLabel>
                                            <Textarea
                                                {...field}
                                                className="input text-xs"
                                                rows={3}
                                                placeholder="Brief overview of the responsibilities and projects in this space..."
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>

                            <div className="pt-2 flex justify-end">
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-3xl bg-rose-500/5 border border-rose-500/30 p-6 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-400" />
                                Danger Zone
                            </h3>
                            <p className="text-xs text-rose-300/80 leading-relaxed">
                                Permanently delete this space. This action cannot be undone and will delete all associated projects and tasks inside this space.
                            </p>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                type="button"
                                onClick={() => setDeleteModalOpen(true)}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Delete Space
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT SPACE MODAL */}
            <PopupModel
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                title="Edit Space"
                description={`Modify configuration for "${space?.name || "Space"}"`}
                icon={<Pencil className="w-5 h-5 text-violet-400" />}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <CardContent className="space-y-4 text-xs pt-2">
                        <form id="modal-form-edit-space" onSubmit={editForm.handleSubmit(onSubmitUpdateSpace)}>
                            <FieldGroup className="space-y-3.5">
                                <Controller
                                    name="name"
                                    control={editForm.control}
                                    rules={{ required: "Space name is required" }}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="input-label font-semibold">
                                                Space Name <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                className="input"
                                                placeholder="e.g., Engineering, Design, Operations"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="icon"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Space Tag / Icon
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                className="input"
                                                placeholder="e.g., ENG, MKT, OPS"
                                                autoComplete="off"
                                            />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="color"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Theme Color
                                            </FieldLabel>
                                            <div className="flex items-center gap-2 pt-1">
                                                {PRESET_COLORS.map((col) => (
                                                    <button
                                                        key={col.hex}
                                                        type="button"
                                                        onClick={() => field.onChange(col.hex)}
                                                        className={`w-5 h-5 rounded-full cursor-pointer ${field.value === col.hex ? "ring-2 ring-white scale-110" : "opacity-80 hover:opacity-100"
                                                            }`}
                                                        style={{ backgroundColor: col.hex }}
                                                    />
                                                ))}
                                                <input
                                                    type="color"
                                                    value={field.value || "#6366f1"}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer ml-1"
                                                />
                                            </div>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Space Description
                                            </FieldLabel>
                                            <Textarea
                                                {...field}
                                                className="input text-xs"
                                                rows={3}
                                                placeholder="Brief scope, department, or team focus..."
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </CardContent>

                    <CardFooter>
                        <Field orientation="horizontal" className="flex items-center justify-between w-full mt-2">
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="modal-form-edit-space" disabled={isUpdating}>
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                        </Field>
                    </CardFooter>
                </div>
            </PopupModel>

            {/* DELETE SPACE CONFIRMATION MODAL */}
            <PopupModel
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Delete Space"
                description="Are you sure you want to permanently delete this space?"
                icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
                maxWidth="max-w-md"
            >
                <div className="space-y-4 pt-2">
                    <CardContent className="space-y-3 text-xs">
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-2">
                            <p className="font-bold text-rose-200">Warning: Permanent Action</p>
                            <p className="text-[11px] leading-relaxed text-rose-300/90">
                                Deleting <span className="font-bold underline text-white">{space?.name}</span> will permanently erase this space along with all associated projects ({projects.length}) and their tasks. This action cannot be reversed.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Field orientation="horizontal" className="flex items-center justify-between w-full mt-2">
                            <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={onConfirmDeleteSpace}
                                disabled={isDeleting}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                            >
                                {isDeleting ? "Deleting..." : "Permanently Delete"}
                            </Button>
                        </Field>
                    </CardFooter>
                </div>
            </PopupModel>

            {/* CREATE PROJECT MODAL */}
            <PopupModel
                open={createProjectModalOpen}
                onOpenChange={setCreateProjectModalOpen}
                title={`New Project in ${space?.name || "Space"}`}
                description="Create a project directly under this organizational space"
                icon={<FolderPlus className="w-5 h-5 text-violet-400" />}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <CardContent className="space-y-4 text-xs pt-2">
                        <form id="form-create-space-project" onSubmit={createProjectForm.handleSubmit(onSubmitCreateProject)}>
                            <FieldGroup className="space-y-3.5">
                                <Controller
                                    name="name"
                                    control={createProjectForm.control}
                                    rules={{ required: "Project name is required" }}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="input-label font-semibold">
                                                Project Name <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                className="input"
                                                placeholder="e.g., Mobile App Launch, Core Engine"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={createProjectForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Project Description
                                            </FieldLabel>
                                            <Textarea
                                                {...field}
                                                className="input text-xs"
                                                rows={3}
                                                placeholder="Objectives, deliverables, and scope..."
                                            />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="isPrivate"
                                    control={createProjectForm.control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#25253d] border border-[#4a4978]/60">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-semibold text-slate-200">
                                                    Private Project
                                                </span>
                                                <p className="text-[10px] text-slate-400">
                                                    Only assigned members can view and access
                                                </p>
                                            </div>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </div>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </CardContent>

                    <CardFooter>
                        <Field orientation="horizontal" className="flex items-center justify-between w-full mt-2">
                            <Button type="button" variant="outline" onClick={() => setCreateProjectModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="form-create-space-project" disabled={isCreatingProject}>
                                {isCreatingProject ? "Creating..." : "Create Project"}
                            </Button>
                        </Field>
                    </CardFooter>
                </div>
            </PopupModel>
        </div>
    );
}