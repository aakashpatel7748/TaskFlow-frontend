"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    FolderKanban,
    Plus,
    Search,
    RefreshCw,
    Lock,
    Globe,
    Calendar,
    ArrowRight,
    Sparkles,
    FolderGit2,
    Layers,
    User,
    CheckCircle2,
    Clock,
    Filter,
    List,
    LayoutGrid,
    Eye,
    Pencil,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { getAllProjectsAPI, createProjectAPI, updateProjectAPI, deleteProjectAPI } from "@/services/opreations/project";
import { getSpaceAPI } from "@/services/opreations/space";
import TanStackTable, { features } from "@/components/table/TanStackTable";
import type { ColumnDef } from "@tanstack/react-table";
import PopupModel from "@/components/tasks/PopupModel";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import PageTitleCard from "@/components/card/PageTitleCard";

export default function ProjectsDirectoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const spaceIdParam = searchParams.get("spaceId");

    const [projects, setProjects] = useState<any[]>([]);
    const [spaces, setSpaces] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    // View mode: TABLE (default as requested by user) or GRID
    const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");

    // Filter states
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSpaceFilter, setSelectedSpaceFilter] = useState<string>(spaceIdParam || "ALL");

    // Sync with spaceId from URL
    useEffect(() => {
        if (spaceIdParam) {
            setSelectedSpaceFilter(spaceIdParam);
        }
    }, [spaceIdParam]);

    // Create Project Modal
    const [createProjectModal, setCreateProjectModal] = useState<boolean>(false);

    // Edit Project Modal
    const [editProjectModal, setEditProjectModal] = useState<boolean>(false);
    const [projectToEdit, setProjectToEdit] = useState<any | null>(null);
    const [isUpdatingProject, setIsUpdatingProject] = useState<boolean>(false);

    // Delete Project Modal
    const [deleteProjectModal, setDeleteProjectModal] = useState<boolean>(false);
    const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
    const [isDeletingProject, setIsDeletingProject] = useState<boolean>(false);

    // Form Hook for Project Creation
    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            spaceId: "",
            isPrivate: false,
        },
    });

    // Form Hook for Project Editing
    const editForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            spaceId: "",
            isPrivate: false,
        },
    });

    // Load workspace ID
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedWs = localStorage.getItem("selectedWorkspaceId");
            if (savedWs) {
                setWorkspaceId(savedWs);
            }
        }
    }, []);

    // Fetch Spaces & Projects for current Workspace
    const fetchProjectsAndSpaces = useCallback(async () => {
        const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
        if (!activeWs) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [spacesRes, projectsRes] = await Promise.all([
                getSpaceAPI().action(activeWs).catch(() => null),
                getAllProjectsAPI().action(activeWs).catch(() => null)
            ]);

            if (spacesRes?.data?.data) {
                setSpaces(spacesRes.data.data);
            }

            if (projectsRes?.data?.data) {
                setProjects(projectsRes.data.data);
            }
        } catch (error) {
            console.error("Error loading projects:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchProjectsAndSpaces();
    }, [fetchProjectsAndSpaces]);

    // Refresh Handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchProjectsAndSpaces();
        setIsRefreshing(false);
        toast.add({
            title: "Projects Refreshed",
            description: "Projects list updated successfully",
        });
    };

    // Filter Projects
    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            const matchesQuery =
                !searchQuery ||
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.space?.name?.toLowerCase().includes(searchQuery.toLowerCase());

            const spaceId = typeof p.space === "object" ? p.space?._id : p.space;
            const matchesSpace = selectedSpaceFilter === "ALL" || spaceId === selectedSpaceFilter;

            return matchesQuery && matchesSpace;
        });
    }, [projects, searchQuery, selectedSpaceFilter]);

    // Quick Stats
    const stats = useMemo(() => {
        const total = projects.length;
        const privateCount = projects.filter((p) => p.isPrivate).length;
        const sharedCount = total - privateCount;
        const uniqueSpaces = new Set(
            projects.map((p) => (typeof p.space === "object" ? p.space?._id : p.space)).filter(Boolean)
        ).size;

        return {
            total,
            privateCount,
            sharedCount,
            spacesCount: uniqueSpaces || spaces.length
        };
    }, [projects, spaces]);

    // Handle Create Project Submit
    const onSubmitCreateProject = async (data: any) => {
        const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
        if (!activeWs) {
            toast.add({
                title: "Creation Failed",
                description: "No active workspace selected",
            });
            return;
        }

        if (!data.spaceId) {
            toast.add({
                title: "Space Required",
                description: "Please select a space for this project",
            });
            return;
        }

        try {
            const payload = {
                name: data.name,
                description: data.description,
                isPrivate: Boolean(data.isPrivate),
                workspaceId: activeWs,
                spaceId: data.spaceId,
            };

            const res = await createProjectAPI().action(payload);
            if (res?.status === 200 || res?.status === 201) {
                toast.add({
                    title: "Project Created",
                    description: `Project "${data.name}" created successfully!`,
                });
                setCreateProjectModal(false);
                form.reset();
                fetchProjectsAndSpaces();
            }
        } catch (error: any) {
            console.error("Create project error:", error);
            toast.add({
                title: "Creation Error",
                description: error?.response?.data?.message || "Could not create project",
            });
        }
    };

    // Handle Open Edit Project Modal
    const handleOpenEditProject = (project: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjectToEdit(project);
        const sId = typeof project.space === "object" ? project.space?._id : (project.space || "");
        editForm.reset({
            name: project.name || "",
            description: project.description || "",
            spaceId: sId,
            isPrivate: Boolean(project.isPrivate),
        });
        setEditProjectModal(true);
    };

    // Handle Submit Edit Project
    const onSubmitUpdateProject = async (data: any) => {
        if (!projectToEdit?._id) return;
        if (!data.name.trim()) {
            toast.add({
                title: "Name Required",
                description: "Please enter a project name",
            });
            return;
        }

        try {
            setIsUpdatingProject(true);
            const payload = {
                name: data.name.trim(),
                description: data.description,
                isPrivate: data.isPrivate,
                spaceId: data.spaceId || undefined,
            };

            const res = await updateProjectAPI().action(projectToEdit._id, payload);
            if (res?.status === 200 || res?.status === 201) {
                toast.add({
                    title: "Project Updated",
                    description: `Project "${data.name}" updated successfully!`,
                });
                setEditProjectModal(false);
                setProjectToEdit(null);
                fetchProjectsAndSpaces();
            }
        } catch (error: any) {
            console.error("Update project error:", error);
            toast.add({
                title: "Update Failed",
                description: error?.response?.data?.message || "Could not update project",
            });
        } finally {
            setIsUpdatingProject(false);
        }
    };

    // Handle Open Delete Project Modal
    const handleOpenDeleteProject = (project: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setDeleteProjectModal(true);
    };

    // Handle Confirm Delete Project
    const onConfirmDeleteProject = async () => {
        if (!projectToDelete?._id) return;
        try {
            setIsDeletingProject(true);
            const res = await deleteProjectAPI().action(projectToDelete._id);
            if (res?.status === 200 || res?.status === 204) {
                toast.add({
                    title: "Project Deleted",
                    description: `Project "${projectToDelete.name}" deleted successfully`,
                });
                setDeleteProjectModal(false);
                setProjectToDelete(null);
                fetchProjectsAndSpaces();
            }
        } catch (error: any) {
            console.error("Delete project error:", error);
            toast.add({
                title: "Delete Failed",
                description: error?.response?.data?.message || "Could not delete project",
            });
        } finally {
            setIsDeletingProject(false);
        }
    };

    // TanStackTable Column Definitions for Projects
    const projectColumns = useMemo<Array<ColumnDef<typeof features, any>>>(() => [
        {
            id: "name",
            header: "Project Name & Scope",
            accessorFn: (row) => row.name,
            cell: (info) => {
                const p = info.row.original;
                return (
                    <div className="flex items-start gap-3">
                        <div className=" text-violet-400 flex items-center justify-center  shrink-0 mt-0.5">
                            <FolderKanban className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white group-hover:text-violet-300 transition-colors text-xs">
                                {p.name}
                            </p>
                            {p.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                                    {p.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "space",
            header: "Space / Dept",
            accessorFn: (row) => typeof row.space === "object" ? row.space?.name : "General Space",
            cell: (info) => {
                const spaceName = typeof info.row.original.space === "object" ? info.row.original.space?.name : "General Space";
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[11px] font-bold border border-violet-500/20 whitespace-nowrap">
                        <FolderGit2 className="w-3 h-3" />
                        {spaceName}
                    </span>
                );
            },
        },
        {
            id: "access",
            header: "Access",
            accessorFn: (row) => row.isPrivate ? "Private" : "Team Shared",
            cell: (info) => {
                const isPrivate = info.row.original.isPrivate;
                return isPrivate ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
                        <Lock className="w-3 h-3" /> Private
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                        <Globe className="w-3 h-3" /> Team Shared
                    </span>
                );
            },
        },
        {
            id: "createdBy",
            header: "Project Lead",
            accessorFn: (row) => row.createdBy?.fullName || row.createdBy?.username || "Workspace Admin",
            cell: (info) => {
                const p = info.row.original;
                const createdByName = p.createdBy?.fullName || p.createdBy?.username || "Workspace Admin";
                const avatar = p.createdBy?.avatar;
                const fallback = createdByName.slice(0, 2).toUpperCase();
                return (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={createdByName}
                                className="w-6 h-6 rounded-full object-cover border border-slate-700"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-sm">
                                {fallback}
                            </div>
                        )}
                        <span className="text-slate-300 text-xs">{createdByName}</span>
                    </div>
                );
            },
        },
        {
            id: "createdAt",
            header: "Created Date",
            accessorFn: (row) => row.createdAt || "",
            cell: (info) => {
                const createdDate = info.row.original.createdAt
                    ? new Date(info.row.original.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Active";
                return (
                    <div className="flex items-center gap-1.5 whitespace-nowrap font-mono text-slate-400 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{createdDate}</span>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: (info) => {
                const p = info.row.original;
                return (
                    <div className="flex items-center  gap-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>


                        <button
                            type="button"
                            onClick={() => router.push(`/tasks/projects/${p._id}`)}
                            className=" px-2 py-1 rounded-xl   text-slate-300   shadow-sm ml-1 cursor-pointer"
                        >
                            <Eye />
                        </button>
                    </div>
                );
            },
        },
    ], [handleOpenEditProject, handleOpenDeleteProject, router]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 select-none text-[var(--foreground)] pb-16">
            <PageTitleCard
                title="Projects Directory"
                description="Manage and track all your projects and initiatives across the workspace"
                icon={<FolderKanban className="w-4 h-4" />}
                action={
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-secondary-light)]  text-secondary  border border-[#4a4978]/70 text-xs font-medium transition cursor-pointer"
                            title="Refresh Projects"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (spaces.length > 0) {
                                    form.setValue("spaceId", spaces[0]._id);
                                }
                                setCreateProjectModal(true);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Project</span>
                        </button>
                    </div>
                }
            />

            {/* Quick Metrics Bar (Compact & Balanced) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Projects</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-white">{stats.total}</span>
                        <FolderKanban className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Registered in workspace</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Spaces</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-indigo-400">{stats.spacesCount}</span>
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Organizational units</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Shared</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-emerald-400">{stats.sharedCount}</span>
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Collaborator accessible</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Private Initiatives</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-amber-400">{stats.privateCount}</span>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Restricted access</p>
                </div>
            </div>

            {/* Filter, Search and View Switcher Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] p-3 rounded-2xl  shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects by name, description, or space..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input"
                        style={{ paddingLeft: "2rem" }}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <Select
                        value={selectedSpaceFilter}
                        onValueChange={(val) => {
                            const newVal = val || "ALL";
                            setSelectedSpaceFilter(newVal);
                            if (newVal === "ALL") {
                                router.push("/tasks/projects");
                            } else {
                                router.push(`/tasks/projects?spaceId=${newVal}`);
                            }
                        }}
                    >
                        <SelectTrigger style={{ borderRadius: "7px" }} className="text-xs h-9 px-3 bg-(var(--color-secondary-light)) text-slate-300 min-w-[140px]">
                            <SelectValue placeholder="All Spaces" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectGroup>
                                <SelectItem value="ALL">All Spaces</SelectItem>
                                {spaces.map((s) => (
                                    <SelectItem key={s._id} value={s._id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* View Switcher: Table View (Default) vs Cards */}
                    <div style={{ borderRadius: "7px" }} className="flex items-center gap-1 p-2 bg-[var(--color-secondary-light)]  rounded-xl ">
                        <button
                            type="button"
                            onClick={() => setViewMode("TABLE")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${viewMode === "TABLE"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                            title="Table View"
                        >
                            <List className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("GRID")}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${viewMode === "GRID"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                            title="Cards View"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cards</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Space Filter Banner when filtered to a specific space */}
            {selectedSpaceFilter !== "ALL" && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#2b2c47] border border-violet-500/30 text-xs shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400">Filtering projects for space:</span>
                        <span className="font-bold text-violet-300 bg-violet-500/15 px-2.5 py-0.5 rounded-full border border-violet-500/30 flex items-center gap-1.5">
                            <FolderGit2 className="w-3.5 h-3.5 text-violet-400" />
                            {spaces.find((s) => s._id === selectedSpaceFilter)?.name || "Selected Space"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                            ({filteredProjects.length} projects found)
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedSpaceFilter("ALL");
                            router.push("/tasks/projects");
                        }}
                        className="text-xs text-violet-400 hover:text-violet-200 font-semibold hover:underline cursor-pointer"
                    >
                        Show All Projects ✕
                    </button>
                </div>
            )}

            {/* PROJECTS CONTENT: TABLE (DEFAULT) OR CARDS */}
            {loading ? (
                <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 p-12 text-center text-xs text-slate-400 animate-pulse">
                    Loading workspace projects directory...
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <FolderKanban className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-200">No projects found</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            {searchQuery
                                ? "No project matching your search query. Try clearing filters."
                                : "Create your first project in this workspace to organize tasks, assignees, and media deliverables."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (spaces.length > 0) form.setValue("spaceId", spaces[0]._id);
                            setCreateProjectModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Project</span>
                    </button>
                </div>
            ) : viewMode === "TABLE" ? (
                /* Projects Table View using shared TanStackTable component */
                <TanStackTable
                    columns={projectColumns}
                    data={filteredProjects}
                    emptyMessage="No matching projects found."
                    onRowClick={(p) => router.push(`/tasks/projects/${p._id}`)}
                />
            ) : (
                /* Grid Cards View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((p) => {
                        const spaceName = typeof p.space === "object" ? p.space?.name : "General Space";
                        const createdByName = p.createdBy?.fullName || p.createdBy?.username || "Workspace Admin";

                        return (
                            <div
                                key={p._id}
                                onClick={() => router.push(`/tasks/projects/${p._id}`)}
                                className="group relative rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 hover:border-violet-500/50 p-6 space-y-5 transition-all duration-300 hover:shadow-xl hover:shadow-violet-600/10 cursor-pointer flex flex-col justify-between"
                            >
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[11px] font-bold border border-violet-500/20">
                                            <FolderGit2 className="w-3 h-3" />
                                            {spaceName}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            {p.isPrivate ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                                                    <Lock className="w-3 h-3" /> Private
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                                    <Globe className="w-3 h-3" /> Team Shared
                                                </span>
                                            )}

                                            <div className="flex items-center gap-1 border-l border-slate-700/60 pl-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenEditProject(p, e)}
                                                    className="p-1 rounded-lg bg-slate-800/80 hover:bg-violet-600/30 text-slate-400 hover:text-violet-300 border border-slate-700/50 transition cursor-pointer"
                                                    title="Edit Project"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenDeleteProject(p, e)}
                                                    className="p-1 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 transition cursor-pointer"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30 group-hover:scale-105 transition shrink-0">
                                            <FolderKanban className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition truncate">
                                                {p.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                                {p.description || "No project description provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="truncate max-w-[120px]">{createdByName}</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-violet-400 font-semibold group-hover:translate-x-1 transition-transform">
                                        <span>Open Workspace</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Project Modal */}
            <PopupModel
                open={createProjectModal}
                onOpenChange={setCreateProjectModal}
                title="Create New Project"
                description="Organize work streams, assign tasks, and track sprints"
                icon={<Sparkles className="w-5 h-5 text-violet-400" />}
                maxWidth="max-w-lg"
            >
                <div className="space-y-4">
                    <CardContent className="space-y-4 text-xs pt-2">
                        <form id="form-create-project" onSubmit={form.handleSubmit(onSubmitCreateProject)}>
                            <FieldGroup className="space-y-3.5">
                                <Controller
                                    name="name"
                                    control={form.control}
                                    rules={{ required: "Project name is required" }}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="input-label font-semibold">
                                                Project Name <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                className="input"
                                                placeholder="e.g., Mobile App MVP, Core API Redesign"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="spaceId"
                                    control={form.control}
                                    rules={{ required: "Please select a space" }}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="input-label font-semibold">
                                                Space / Department <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="select">
                                                    <SelectValue placeholder="Select a Space" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {spaces.map((space) => (
                                                            <SelectItem key={space._id} value={space._id}>
                                                                {space.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Project Description
                                            </FieldLabel>
                                            <Textarea
                                                {...field}
                                                className="input text-xs"
                                                rows={3}
                                                placeholder="Brief scope, deliverables, or objectives..."
                                            />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="isPrivate"
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-semibold text-slate-200">Private Project</span>
                                                <p className="text-[11px] text-slate-400">Only invited members can view and access</p>
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
                            <Button type="button" variant="outline" onClick={() => setCreateProjectModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="form-create-project">
                                Create Project
                            </Button>
                        </Field>
                    </CardFooter>
                </div>
            </PopupModel>

            {/* Edit Project Modal */}
            <PopupModel
                open={editProjectModal}
                onOpenChange={setEditProjectModal}
                title="Edit Project"
                description={`Update configuration and settings for "${projectToEdit?.name || "Project"}"`}
                icon={<Pencil className="w-5 h-5 text-violet-400" />}
                maxWidth="max-w-lg"
            >
                <div className="space-y-4">
                    <CardContent className="space-y-4 text-xs pt-2">
                        <form id="form-edit-project" onSubmit={editForm.handleSubmit(onSubmitUpdateProject)}>
                            <FieldGroup className="space-y-3.5">
                                <Controller
                                    name="name"
                                    control={editForm.control}
                                    rules={{ required: "Project name is required" }}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="input-label font-semibold">
                                                Project Name <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                className="input"
                                                placeholder="e.g., Mobile App Redesign, Marketing Campaign"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="spaceId"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Assigned Space
                                            </FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="input w-full flex items-center justify-between">
                                                    <SelectValue placeholder="Select space" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {spaces.map((space) => (
                                                            <SelectItem key={space._id} value={space._id}>
                                                                {space.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="input-label font-semibold">
                                                Project Description
                                            </FieldLabel>
                                            <Textarea
                                                {...field}
                                                className="input text-xs"
                                                rows={3}
                                                placeholder="Brief scope, deliverables, or objectives..."
                                            />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="isPrivate"
                                    control={editForm.control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-semibold text-slate-200">Private Project</span>
                                                <p className="text-[11px] text-slate-400">Only invited members can view and access</p>
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
                            <Button type="button" variant="outline" onClick={() => setEditProjectModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="form-edit-project" disabled={isUpdatingProject}>
                                {isUpdatingProject ? "Saving..." : "Save Changes"}
                            </Button>
                        </Field>
                    </CardFooter>
                </div>
            </PopupModel>

            {/* Delete Project Confirmation Modal */}
            <PopupModel
                open={deleteProjectModal}
                onOpenChange={setDeleteProjectModal}
                title="Delete Project"
                description="Are you sure you want to delete this project?"
                icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
                maxWidth="max-w-md"
            >
                <div className="space-y-4 pt-2">
                    <CardContent className="space-y-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                            <p className="font-semibold text-rose-200">Warning: Permanent Deletion</p>
                            <p className="text-[11px] leading-relaxed text-rose-300/90">
                                Deleting <span className="font-bold underline">{projectToDelete?.name}</span> will permanently remove this project and all of its tasks. This action cannot be undone.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Field orientation="horizontal" className="flex items-center justify-between w-full mt-2">
                            <Button type="button" variant="outline" onClick={() => setDeleteProjectModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={onConfirmDeleteProject}
                                disabled={isDeletingProject}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                            >
                                {isDeletingProject ? "Deleting..." : "Delete Project"}
                            </Button>
                        </Field>
                    </CardFooter>
                </div>
            </PopupModel>
        </div>
    );
}