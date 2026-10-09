"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Layers,
    Plus,
    Search,
    RefreshCw,
    FolderKanban,
    Calendar,
    ArrowRight,
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
    View,
    ViewIcon,
    Eye
} from "lucide-react";
import { getSpaceAPI, createSpaceAPI, updateSpaceAPI, deleteSpaceAPI } from "@/services/opreations/space";
import { getAllProjectsAPI } from "@/services/opreations/project";
import TanStackTable, { features } from "@/components/table/TanStackTable";
import type { ColumnDef } from "@tanstack/react-table";
import PopupModel from "@/components/tasks/PopupModel";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import PageTitleCard from "@/components/card/PageTitleCard";

export default function SpacesDirectoryPage() {
    const router = useRouter();

    const [spaces, setSpaces] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    // View mode: TABLE (default) or GRID
    const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");

    // Search query
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modal State: "CREATE" | "EDIT" | "DELETE" | null (Single condition-based modal)
    const [modalMode, setModalMode] = useState<"CREATE" | "EDIT" | "DELETE" | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Single unified form hook for Space Create/Edit
    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            color: "#6366f1",
            icon: "",
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
    const fetchSpacesData = useCallback(async () => {
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
            console.error("Error loading spaces:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchSpacesData();
    }, [fetchSpacesData]);

    // Refresh Handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchSpacesData();
        setIsRefreshing(false);
        toast.add({
            title: "Spaces Refreshed",
            description: "Spaces list updated successfully",
        });
    };

    // Calculate project count map
    const spaceProjectCountMap = useMemo(() => {
        const map: Record<string, number> = {};
        projects.forEach((p) => {
            const sId = typeof p.space === "object" ? p.space?._id : p.space;
            if (sId) {
                map[sId] = (map[sId] || 0) + 1;
            }
        });
        return map;
    }, [projects]);

    // Filter Spaces
    const filteredSpaces = useMemo(() => {
        return spaces.filter((s) => {
            const query = searchQuery.toLowerCase();
            return (
                !query ||
                s.name?.toLowerCase().includes(query) ||
                s.description?.toLowerCase().includes(query)
            );
        });
    }, [spaces, searchQuery]);

    // Quick Stats
    const stats = useMemo(() => {
        const totalSpaces = spaces.length;
        const totalProjects = projects.length;
        const spacesWithProjects = Object.keys(spaceProjectCountMap).length;

        return {
            totalSpaces,
            totalProjects,
            activeSpaces: spacesWithProjects,
        };
    }, [spaces, projects, spaceProjectCountMap]);

    // Modal Open/Close Handlers
    const handleCloseModal = () => {
        setModalMode(null);
        setSelectedSpace(null);
        form.reset({ name: "", description: "", color: "#6366f1", icon: "" });
    };

    const handleOpenCreateSpace = () => {
        setSelectedSpace(null);
        form.reset({ name: "", description: "", color: "#6366f1", icon: "" });
        setModalMode("CREATE");
    };

    const handleOpenEditSpace = (space: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedSpace(space);
        form.reset({
            name: space.name || "",
            description: space.description || "",
            icon: space.icon || "",
            color: space.color || "#6366f1",
        });
        setModalMode("EDIT");
    };

    const handleOpenDeleteSpace = (space: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedSpace(space);
        setModalMode("DELETE");
    };

    // Unified Submit Handler for CREATE and EDIT
    const onSubmitSpace = async (data: any) => {
        if (!data.name?.trim()) {
            toast.add({
                title: "Name Required",
                description: "Please enter a space name",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            if (modalMode === "EDIT") {
                if (!selectedSpace?._id) return;
                const payload = {
                    name: data.name.trim(),
                    description: data.description || "",
                    icon: data.icon || "",
                    color: data.color || "#6366f1",
                };

                const res = await updateSpaceAPI().action(selectedSpace._id, payload);
                if (res?.status === 200 || res?.status === 201) {
                    toast.add({
                        title: "Space Updated",
                        description: `Space "${data.name}" updated successfully!`,
                    });
                    handleCloseModal();
                    fetchSpacesData();
                }
            } else if (modalMode === "CREATE") {
                const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
                if (!activeWs) {
                    toast.add({
                        title: "Creation Failed",
                        description: "No active workspace selected",
                    });
                    return;
                }

                const payload = {
                    name: data.name.trim(),
                    description: data.description || "",
                    icon: data.icon || "Layers",
                    color: data.color || "#6366f1",
                    workSpaceId: activeWs,
                };

                const res = await createSpaceAPI().action(payload);
                if (res?.status === 200 || res?.status === 201) {
                    toast.add({
                        title: "Space Created",
                        description: `Space "${data.name}" created successfully!`,
                    });
                    handleCloseModal();
                    fetchSpacesData();
                }
            }
        } catch (error: any) {
            console.error("Space submit error:", error);
            toast.add({
                title: modalMode === "EDIT" ? "Update Failed" : "Creation Error",
                description: error?.response?.data?.message || "Operation failed",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Confirm Delete Space Handler
    const onConfirmDeleteSpace = async () => {
        if (!selectedSpace?._id) return;
        try {
            setIsSubmitting(true);
            const res = await deleteSpaceAPI().action(selectedSpace._id);
            if (res?.status === 200 || res?.status === 204) {
                toast.add({
                    title: "Space Deleted",
                    description: `Space "${selectedSpace.name}" deleted successfully`,
                });
                handleCloseModal();
                fetchSpacesData();
            }
        } catch (error: any) {
            console.error("Delete space error:", error);
            toast.add({
                title: "Delete Failed",
                description: error?.response?.data?.message || "Could not delete space",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // TanStackTable Column Definitions for Spaces
    const spaceColumns = useMemo<Array<ColumnDef<typeof features, any>>>(() => [
        {
            id: "name",
            header: "Space Name & Description",
            accessorFn: (row) => row.name,
            cell: (info) => {
                const space = info.row.original;
                return (
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-600/15 text-violet-400 flex items-center justify-center border border-violet-500/25 shrink-0 group-hover:scale-105 transition mt-0.5">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-white group-hover:text-violet-300 transition-colors text-xs">
                                    {space.name}
                                </p>
                                {space.icon && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                        {space.icon}
                                    </span>
                                )}
                            </div>
                            {space.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                                    {space.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "projects",
            header: "Linked Projects",
            accessorFn: (row) => spaceProjectCountMap[row._id] || 0,
            cell: (info) => {
                const count = spaceProjectCountMap[info.row.original._id] || 0;
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[11px] font-bold border border-violet-500/20 whitespace-nowrap">
                        <FolderGit2 className="w-3 h-3" />
                        {count} Projects
                    </span>
                );
            },
        },
        {
            id: "createdBy",
            header: "Space Lead / Creator",
            accessorFn: (row) => row.createdBy?.fullName || row.createdBy?.username || "Workspace Admin",
            cell: (info) => {
                const space = info.row.original;
                const createdByName = space.createdBy?.fullName || space.createdBy?.username || "Workspace Admin";
                const avatar = space.createdBy?.avatar;
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
                const space = info.row.original;
                return (
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/tasks/spaces/${space._id}`);
                            }}
                            className="p-1.5 rounded-lg  text-slate-400   transition cursor-pointer"
                            title="View Space Details"
                        >
                            <Eye className="w-3 h-3" />
                        </button>

                    </div>
                );
            },
        },
    ], [handleOpenEditSpace, handleOpenDeleteSpace, router, spaceProjectCountMap]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 select-none text-[var(--foreground)] pb-16">
            {/* Top Header Banner - Matched to TaskFlow Theme (#2b2c47 / #353456) */}
            <PageTitleCard
                title="Spaces Directory"
                description="Organize workspace initiatives, teams, and departments. Select any space to inspect its active projects and milestone deliverables."
                icon={<Layers className="w-4 h-4" />}
                action={
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl  txt-secondry  border border-[#4a4978]/70 text-xs font-medium transition cursor-pointer"
                            title="Refresh Spaces"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenCreateSpace}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Space</span>
                        </button>
                    </div>
                }

            />


            {/* Quick Metrics Bar (Compact & Balanced) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spaces</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-white">{stats.totalSpaces}</span>
                        <Layers className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Organizational departments</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Projects</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-indigo-400">{stats.totalProjects}</span>
                        <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Initiatives across all spaces</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Workspaces</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-emerald-400">{stats.activeSpaces}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Spaces with active projects</p>
                </div>
            </div>

            {/* Search and View Switcher Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] p-3 rounded-2xl   shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search spaces by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input  "
                        style={{ paddingLeft: "35px", height: "40px" }}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* View Switcher: Table View (Default) vs Cards */}
                    <div className="flex items-center gap-1 p-1 bg-[var(--color-secondry-light)] rounded-xl border border-[#4a4978]/60">
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

            {/* SPACES CONTENT: TABLE (DEFAULT) OR CARDS */}
            {loading ? (
                <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 p-12 text-center text-xs text-slate-400 animate-pulse">
                    Loading workspace spaces directory...
                </div>
            ) : filteredSpaces.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#25253d] flex items-center justify-center mx-auto text-slate-500">
                        <Layers className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-200">No spaces found</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            {searchQuery
                                ? "No spaces matching your search query. Try clearing filters."
                                : "Create your first space in this workspace to organize team departments and projects."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenCreateSpace}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Space</span>
                    </button>
                </div>
            ) : viewMode === "TABLE" ? (
                /* Spaces Table View using shared TanStackTable component */
                <TanStackTable
                    columns={spaceColumns}
                    data={filteredSpaces}
                    emptyMessage="No matching spaces found."
                    onRowClick={(space) => router.push(`/tasks/projects?spaceId=${space._id}`)}
                />
            ) : (
                /* Grid Cards View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSpaces.map((space) => {
                        const projectCount = spaceProjectCountMap[space._id] || 0;
                        const createdByName = space.createdBy?.fullName || space.createdBy?.username || "Workspace Admin";

                        return (
                            <div
                                key={space._id}
                                onClick={() => router.push(`/tasks/projects?spaceId=${space._id}`)}
                                className="group relative rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 hover:border-violet-500/50 p-6 space-y-5 transition-all duration-300 hover:shadow-xl hover:shadow-violet-600/10 cursor-pointer flex flex-col justify-between"
                            >
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[11px] font-bold border border-violet-500/20">
                                            <FolderGit2 className="w-3 h-3" />
                                            {projectCount} Projects
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={(e) => handleOpenEditSpace(space, e)}
                                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-violet-600/30 text-slate-400 hover:text-violet-300 border border-slate-700/50 transition cursor-pointer"
                                                title="Edit Space"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleOpenDeleteSpace(space, e)}
                                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 transition cursor-pointer"
                                                title="Delete Space"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30 group-hover:scale-105 transition shrink-0">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition truncate">
                                                {space.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                                {space.description || "Organizational department space housing tasks and initiatives."}
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
                                        <span>View Projects</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Single Unified Space Modal (Condition-based: CREATE, EDIT, DELETE) */}
            <PopupModel
                open={modalMode !== null}
                onOpenChange={(open) => {
                    if (!open) handleCloseModal();
                }}
                title={
                    modalMode === "DELETE"
                        ? "Delete Space"
                        : modalMode === "EDIT"
                            ? "Edit Space"
                            : "Create New Space"
                }
                description={
                    modalMode === "DELETE"
                        ? "Are you sure you want to delete this space?"
                        : modalMode === "EDIT"
                            ? `Update configuration and information for "${selectedSpace?.name || "Space"}"`
                            : "Configure a new organizational space for your projects and initiatives"
                }
                icon={
                    modalMode === "DELETE" ? (
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                    ) : modalMode === "EDIT" ? (
                        <Pencil className="w-5 h-5 text-violet-400" />
                    ) : (
                        <Sparkles className="w-5 h-5 text-violet-400" />
                    )
                }
                maxWidth="max-w-md"
            >
                {modalMode === "DELETE" ? (
                    /* Condition 1: Delete Space */
                    <div className="space-y-4 pt-2">
                        <CardContent className="space-y-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                                <p className="font-semibold text-rose-200">Warning: Permanent Deletion</p>
                                <p className="text-[11px] leading-relaxed text-rose-300/90">
                                    Deleting <span className="font-bold underline text-white">{selectedSpace?.name}</span> will permanently remove this space and all associated projects and tasks. This action cannot be undone.
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Field orientation="horizontal" className="flex items-center justify-between w-full mt-2">
                                <Button type="button" variant="outline" onClick={handleCloseModal}>
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={onConfirmDeleteSpace}
                                    disabled={isSubmitting}
                                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                                >
                                    {isSubmitting ? "Deleting..." : "Delete Space"}
                                </Button>
                            </Field>
                        </CardFooter>
                    </div>
                ) : (
                    /* Condition 2: Create or Edit Space (Single Form) */
                    <div className="space-y-4">
                        <CardContent className="space-y-4 text-xs pt-2">
                            <form id="form-space-unified" onSubmit={form.handleSubmit(onSubmitSpace)}>
                                <FieldGroup className="space-y-3.5">
                                    <Controller
                                        name="name"
                                        control={form.control}
                                        rules={{ required: "Space name is required" }}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className="input-label font-semibold">
                                                    Space Name <span className="text-rose-500">*</span>
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className="input"
                                                    placeholder="e.g., Engineering, Marketing, Product Design"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="icon"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel className="input-label font-semibold">
                                                    Space Tag / Icon
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className="input"
                                                    placeholder="e.g., ENG, MKT, DES"
                                                    autoComplete="off"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="description"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel className="input-label font-semibold">
                                                    Space Description
                                                </FieldLabel>
                                                <Textarea
                                                    {...field}
                                                    className="input text-xs"
                                                    rows={3}
                                                    placeholder="Brief purpose, team members, or domain scope..."
                                                />
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                            </form>
                        </CardContent>

                        <CardFooter>
                            <Field orientation="horizontal" className="flex items-center justify-between w-full mt-2">
                                <Button type="button" variant="outline" onClick={handleCloseModal}>
                                    Cancel
                                </Button>
                                <Button type="submit" form="form-space-unified" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? modalMode === "EDIT"
                                            ? "Saving..."
                                            : "Creating..."
                                        : modalMode === "EDIT"
                                            ? "Save Changes"
                                            : "Create Space"}
                                </Button>
                            </Field>
                        </CardFooter>
                    </div>
                )}
            </PopupModel>
        </div>
    );
}
