"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    FolderKanban,
    List,
    BarChart3,
    Users,
    Plus,
    UserPlus,
    Flame,
    TrendingUp,
    Sparkles,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
    Lock,
    Globe,
    Calendar,
    Search,
    Paperclip,
    ExternalLink,
    Image as ImageIcon,
    Download,
    Eye,
    X,
    FolderGit2,
    Layers,
    User,
    CheckSquare2,
    Maximize2,
    Pencil,
    Trash2,
    AlertTriangle
} from "lucide-react";
import Board, { TaskItem } from "@/components/tasks/Board";
import TaskListView from "@/components/tasks/TaskListView";
import PopupModel from "@/components/tasks/PopupModel";
import InviteMemberModal from "@/components/team/InviteMemberModal";
import { getProjectAPI, updateProjectAPI, deleteProjectAPI } from "@/services/opreations/project";
import { getSpaceAPI } from "@/services/opreations/space";
import { getTasksAPI, createTaskAPI } from "@/services/opreations/tasks";
import { getEmailInvitationList } from "@/services/opreations/emailInvitation";
import { fetchWorkSpaceAPI } from "@/services/opreations/workspace";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TaskPriority, TaskStatus } from "@/components/constant";
import { toast } from "@/components/ui/toast";
import PageTitleCard from "@/components/card/PageTitleCard";

export default function DedicatedProjectPage() {
    const params = useParams<{ projectId: string }>();
    const router = useRouter();
    const projectId = params?.projectId;

    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);
    const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"OVERVIEW" | "BOARD" | "LIST" | "MEDIA" | "METRICS">("OVERVIEW");
    const [taskPopup, setTaskPopup] = useState<boolean>(false);
    const [createDefaultStatus, setCreateDefaultStatus] = useState<string>("to-do");
    const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);

    // Edit and Delete Project state
    const [editProjectModal, setEditProjectModal] = useState<boolean>(false);
    const [isUpdatingProject, setIsUpdatingProject] = useState<boolean>(false);
    const [deleteProjectModal, setDeleteProjectModal] = useState<boolean>(false);
    const [isDeletingProject, setIsDeletingProject] = useState<boolean>(false);
    const [spacesList, setSpacesList] = useState<any[]>([]);

    // Edit project form hook
    const editProjectForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            spaceId: "",
            isPrivate: false,
        },
    });

    const [invitedList, setInvitedList] = useState<any[]>([]);
    const [workspacesList, setWorkspacesList] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Lightbox modal for image attachments preview
    const [lightboxImage, setLightboxImage] = useState<{ url: string; name?: string } | null>(null);

    // Selected task for task detail popup
    const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

    // Search and filter state
    const [searchFilter, setSearchFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    // Load workspace ID from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedWs = localStorage.getItem("selectedWorkspaceId");
            if (savedWs) {
                setWorkspaceId(savedWs);
            }
        }
    }, []);

    // Helper: Normalize raw task data
    const normalizeTask = useCallback((t: any): TaskItem => {
        const id = t._id || t.id || `task-${Math.random()}`;
        const name = t.name || t.title || "Untitled Task";
        const rawStatus = (t.status || "to-do").toLowerCase().replace("_", "-");
        let status = "to-do";
        if (rawStatus.includes("progress") || rawStatus.includes("review")) {
            status = "in-progress";
        } else if (rawStatus.includes("complete") || rawStatus.includes("done")) {
            status = "completed";
        }

        const rawPriority = (t.priority || "medium").toLowerCase();
        let priority = "medium";
        if (rawPriority.includes("urgent")) priority = "urgent";
        else if (rawPriority.includes("high")) priority = "high";
        else if (rawPriority.includes("low")) priority = "low";

        const assigneeObj = t.assignee;
        const assigneeName = assigneeObj?.fullName || assigneeObj?.username || t.assigneeEmail || "Unassigned";
        const assigneeEmail = assigneeObj?.email || t.assigneeEmail || "";
        const fallback = assigneeName.slice(0, 2).toUpperCase();

        return {
            _id: id,
            id: id,
            key: `TASK-${id.slice(-4).toUpperCase()}`,
            name,
            title: name,
            description: t.description || "",
            status,
            rawStatus: t.status,
            priority,
            rawPriority: t.priority,
            dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
            assignee: {
                fullName: assigneeName,
                name: assigneeName,
                email: assigneeEmail,
                avatar: assigneeObj?.avatar || "",
                fallback,
            },
            files: t.files || [],
            projectId: t.projectId || projectId,
            raw: t
        };
    }, [projectId]);

    // Fetch Project / Task Details
    const fetchProject = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoadingProject(true);
            const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
            const response = await getProjectAPI().action(activeWs, projectId);
            if (response?.data?.data) {
                setProject(response.data.data);
                if (response.data.data.workspace?._id && !workspaceId) {
                    setWorkspaceId(response.data.data.workspace._id);
                    localStorage.setItem("selectedWorkspaceId", response.data.data.workspace._id);
                }
            }
        } catch (error) {
            console.error("Error fetching project:", error);
        } finally {
            setLoadingProject(false);
        }
    }, [projectId, workspaceId]);

    // Fetch Tasks for this Project
    const fetchTasks = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoadingTasks(true);
            const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
            const response = await getTasksAPI().action(projectId, activeWs);
            if (response?.data?.data) {
                const rawTasks = response.data.data || [];
                const normalized = rawTasks.map(normalizeTask);
                setTasks(normalized);
            }
        } catch (error) {
            console.error("Error fetching project tasks:", error);
        } finally {
            setLoadingTasks(false);
        }
    }, [projectId, workspaceId, normalizeTask]);

    // Fetch Collaborators
    const fetchWorkspaceAndInvites = useCallback(async () => {
        try {
            const [invRes, wsRes] = await Promise.all([
                getEmailInvitationList().action().catch(() => null),
                fetchWorkSpaceAPI().action().catch(() => null)
            ]);

            if (invRes?.data?.data) {
                setInvitedList(invRes.data.data);
            }
            if (wsRes?.data?.data) {
                const workspaces = wsRes.data.data || [];
                setWorkspacesList(workspaces);
                if (!workspaceId && workspaces.length > 0) {
                    setWorkspaceId(workspaces[0]._id);
                }
            }
        } catch (error) {
            console.error("Error fetching workspace or invites:", error);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchProject();
        fetchTasks();
        fetchWorkspaceAndInvites();
    }, [fetchProject, fetchTasks, fetchWorkspaceAndInvites]);

    // Refresh Handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchProject(), fetchTasks()]);
        setIsRefreshing(false);
        toast.add({
            title: "Updated",
            description: "Project details and tasks refreshed",
        });
    };

    // Handle Open Edit Project Modal
    const handleOpenEditProject = async () => {
        if (!project) return;
        const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
        if (activeWs) {
            try {
                const spacesRes = await getSpaceAPI().action(activeWs);
                if (spacesRes?.data?.data) {
                    setSpacesList(spacesRes.data.data);
                }
            } catch (err) {
                console.error("Failed to load spaces:", err);
            }
        }
        const sId = typeof project.space === "object" ? project.space?._id : (project.space || "");
        editProjectForm.reset({
            name: project.name || "",
            description: project.description || "",
            spaceId: sId,
            isPrivate: Boolean(project.isPrivate),
        });
        setEditProjectModal(true);
    };

    // Handle Submit Update Project
    const onSubmitUpdateProject = async (data: any) => {
        if (!projectId) return;
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
            const res = await updateProjectAPI().action(projectId, payload);
            if (res?.status === 200 || res?.status === 201) {
                toast.add({
                    title: "Project Updated",
                    description: `Project "${data.name}" updated successfully!`,
                });
                setEditProjectModal(false);
                fetchProject();
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

    // Handle Confirm Delete Project
    const onConfirmDeleteProject = async () => {
        if (!projectId) return;
        try {
            setIsDeletingProject(true);
            const res = await deleteProjectAPI().action(projectId);
            if (res?.status === 200 || res?.status === 204) {
                toast.add({
                    title: "Project Deleted",
                    description: `Project was deleted successfully`,
                });
                setDeleteProjectModal(false);
                router.push("/tasks/projects");
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

    // Collect all media / image attachments across this project and its tasks
    const allAttachments = useMemo(() => {
        const list: Array<{ filename: string; fileUrl: string; taskName?: string; taskId?: string }> = [];

        tasks.forEach(t => {
            if (t.files && Array.isArray(t.files)) {
                t.files.forEach(f => {
                    if (f.fileUrl && !list.some(existing => existing.fileUrl === f.fileUrl)) {
                        list.push({ ...f, taskName: t.name, taskId: t._id });
                    }
                });
            }
        });

        return list;
    }, [tasks]);

    // Check if a file URL is an image
    const isImageFile = (url: string) => {
        if (!url) return false;
        const clean = url.toLowerCase();
        return (
            clean.includes("imagekit.io") ||
            clean.includes("cloudinary.com") ||
            clean.endsWith(".jpg") ||
            clean.endsWith(".jpeg") ||
            clean.endsWith(".png") ||
            clean.endsWith(".webp") ||
            clean.endsWith(".gif") ||
            clean.endsWith(".svg")
        );
    };

    // Convert ImageKit URL to web-safe resized URL (fixes 400 Bad Request error caused by 25MP limit)
    const getSafeImageUrl = (url: string, width = 1600) => {
        if (!url) return "";
        if (url.includes("ik.imagekit.io")) {
            const clean = url.split("?")[0];
            return `${clean}?tr=w-${width}`;
        }
        return url;
    };

    // Filtered Tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            const taskTitle = t.name || t.title || "";
            const matchesQuery = !searchFilter ||
                taskTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(searchFilter.toLowerCase())) ||
                (t.key && t.key.toLowerCase().includes(searchFilter.toLowerCase())) ||
                (t.assignee?.fullName && t.assignee.fullName.toLowerCase().includes(searchFilter.toLowerCase()));

            const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter.toLowerCase();

            return matchesQuery && matchesPriority;
        });
    }, [tasks, searchFilter, priorityFilter]);

    // Metrics Calculations
    const metrics = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === "completed").length;
        const inProgress = tasks.filter((t) => t.status === "in-progress").length;
        const todo = tasks.filter((t) => t.status === "to-do").length;

        const urgent = tasks.filter((t) => t.priority === "urgent").length;
        const high = tasks.filter((t) => t.priority === "high").length;
        const medium = tasks.filter((t) => t.priority === "medium").length;
        const low = tasks.filter((t) => t.priority === "low").length;

        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const completedPct = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";
        const inProgressPct = total > 0 ? ((inProgress / total) * 100).toFixed(1) : "0.0";
        const todoPct = total > 0 ? ((todo / total) * 100).toFixed(1) : "0.0";

        return {
            total,
            completed,
            inProgress,
            todo,
            urgent,
            high,
            medium,
            low,
            rate,
            completedPct,
            inProgressPct,
            todoPct
        };
    }, [tasks]);

    // Form Hook for Task Creation
    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            files: "",
            status: "to-do",
            priority: "medium",
            dueDate: "",
            assignee: "",
            projectId: projectId || "",
        },
    });

    const openAddTaskModal = (status: string = "to-do") => {
        setCreateDefaultStatus(status);
        form.setValue("status", status);
        form.setValue("projectId", projectId || "");
        setTaskPopup(true);
    };

    // Task Creation Submit
    const onSubmitTask = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description || "");
            formData.append("status", data.status || createDefaultStatus || "to-do");
            formData.append("priority", data.priority || "medium");
            if (data.dueDate) formData.append("dueDate", data.dueDate);
            if (data.assignee && data.assignee !== "none") formData.append("assignee", data.assignee);
            const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
            if (activeWs) formData.append("workspaceId", activeWs);
            if (projectId) formData.append("projectId", projectId);
            if (data.files) formData.append("files", data.files);

            const response = await createTaskAPI().action(formData);
            if (response?.status === 200 || response?.status === 201) {
                toast.add({
                    title: "Task Created",
                    description: `"${data.name}" successfully created!`,
                });
                setTaskPopup(false);
                form.reset();
                fetchTasks();
            }
        } catch (error: any) {
            console.error("Task creation failed:", error);
            toast.add({
                title: "Creation Failed",
                description: error?.response?.data?.message || "Please fill all required fields",
            });
        }
    };

    // Loading Shimmer Screen
    if (loadingProject && !project && loadingTasks) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse select-none">
                <div className="h-6 w-48 bg-slate-800/60 rounded-xl"></div>
                <div className="h-48 rounded-3xl bg-slate-800/40 border border-slate-800 p-6 space-y-4">
                    <div className="h-8 w-72 bg-slate-700/60 rounded-xl"></div>
                    <div className="h-4 w-96 bg-slate-800/60 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 rounded-2xl bg-slate-800/40 border border-slate-800"></div>
                    ))}
                </div>
                <div className="h-96 rounded-2xl bg-slate-800/30 border border-slate-800"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 select-none text-[var(--foreground)] pb-12">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <button
                        type="button"
                        onClick={() => router.push("/tasks/projects")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 transition cursor-pointer font-medium"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All Projects</span>
                    </button>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-400 font-medium">
                        {project?.space?.name || project?.workspace?.name || "Workspace"}
                    </span>
                    <span className="text-slate-600">/</span>
                    <span className="text-violet-400 font-semibold truncate max-w-[200px]">
                        {project?.name || "Project View"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 text-xs font-medium transition cursor-pointer"
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            <PageTitleCard
                title={project?.name || "Project Workspace"}
                description={project?.description || ""}
                icon={<FolderGit2 className="w-3.5 h-3.5" />}
                action={<div className="flex items-center gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => openAddTaskModal("to-do")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsInviteOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                        <UserPlus className="w-3.5 h-3.5 text-violet-400" />
                        <span>Invite</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenEditProject}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-violet-600/30 border border-slate-700 hover:border-violet-500/50 text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                        title="Edit Project Details"
                    >
                        <Pencil className="w-3.5 h-3.5 text-violet-400" />
                        <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setDeleteProjectModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold shadow-sm transition cursor-pointer"
                        title="Delete Project"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                </div>}
            />



            {/* Quick Metrics Bar (Compact Proportions) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)]/40 shadow-sm space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Completion Velocity
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-white">{metrics.rate}%</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            {metrics.completed}/{metrics.total} Done
                        </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${metrics.rate}%` }}
                        ></div>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)]/40 shadow-sm space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Tasks
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-slate-100">{metrics.total}</span>
                        <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                        {metrics.todo} Backlog / To Do
                    </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)]/40 shadow-sm space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        In Progress
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-blue-400">{metrics.inProgress}</span>
                        <span className="text-[10px] text-blue-400/80 font-medium">Active</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                        {metrics.inProgressPct}% of workload
                    </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)]/40 shadow-sm space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Attachments & Media
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-amber-400">{allAttachments.length}</span>
                        <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-0.5">
                            <ImageIcon className="w-3 h-3 text-amber-400" /> Files
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                        Images & docs attached
                    </p>
                </div>
            </div>

            {/* ATTACHED IMAGES & MEDIA SHOWCASE (User explicitly requested image preview display) */}
            {allAttachments.length > 0 && (
                <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Attached Images & Media</h3>
                                <p className="text-[11px] text-slate-400">
                                    {allAttachments.length} file{allAttachments.length === 1 ? "" : "s"} attached to this task/project
                                </p>
                            </div>
                        </div>

                        <span className="text-[11px] font-mono text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                            Click image to expand
                        </span>
                    </div>

                    {/* Image Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
                        {allAttachments.map((item, idx) => {
                            const isImg = isImageFile(item.fileUrl);
                            return (
                                <div
                                    key={item.fileUrl || idx}
                                    className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden hover:border-violet-500/50 shadow-md transition-all duration-300 flex flex-col"
                                >
                                    {/* Image or File Thumbnail */}
                                    <div
                                        onClick={() => isImg && setLightboxImage({ url: item.fileUrl, name: item.filename })}
                                        className={`relative w-full h-44 bg-slate-950 flex items-center justify-center overflow-hidden ${isImg ? "cursor-pointer" : ""
                                            }`}
                                    >
                                        {isImg ? (
                                            <>
                                                <img
                                                    src={getSafeImageUrl(item.fileUrl, 600)}
                                                    alt={item.filename || "Attachment"}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <span className="p-2 rounded-xl bg-violet-600/90 text-white shadow-lg">
                                                        <Maximize2 className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-4 text-center space-y-2">
                                                <Paperclip className="w-8 h-8 text-violet-400 mx-auto" />
                                                <span className="text-[11px] text-slate-300 font-mono block truncate max-w-[160px]">
                                                    {item.filename || "Document File"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info & Actions */}
                                    <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                        <div className="min-w-0 pr-2">
                                            <p className="font-semibold text-slate-200 truncate text-[11px]">
                                                {item.filename || `Attachment-${idx + 1}`}
                                            </p>
                                            {item.taskName && (
                                                <p className="text-[10px] text-slate-400 truncate">
                                                    Task: {item.taskName}
                                                </p>
                                            )}
                                        </div>

                                        <a
                                            href={getSafeImageUrl(item.fileUrl, 1800)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white transition shrink-0"
                                            title="Download or view original"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Navigation Tabs Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] p-2 rounded-2xl border border-[var(--border)]/40 shadow-sm">
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
                    <button
                        type="button"
                        onClick={() => setActiveTab("OVERVIEW")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${activeTab === "OVERVIEW"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <CheckSquare2 className="w-3.5 h-3.5" />
                        <span>Overview</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("BOARD")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${activeTab === "BOARD"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <FolderKanban className="w-3.5 h-3.5" />
                        <span>Board</span>
                        <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/15">
                            {tasks.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("LIST")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${activeTab === "LIST"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        <span>List</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("MEDIA")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${activeTab === "MEDIA"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media ({allAttachments.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("METRICS")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${activeTab === "METRICS"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Metrics</span>
                    </button>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tasks or files..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition"
                        />
                    </div>

                    <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val || "ALL")}>
                        <SelectTrigger className="text-xs h-8 px-2.5 bg-slate-900/70 border-slate-800 text-slate-300">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectGroup>
                                <SelectItem value="ALL">All Priorities</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* TAB CONTENT */}

            {/* 1. OVERVIEW TAB */}
            {activeTab === "OVERVIEW" && (
                <div className="space-y-6">
                    {/* Project Mission & Scope Card */}
                    <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-400" />
                                <h3 className="text-sm font-bold text-white">Project Scope & Guidelines</h3>
                            </div>
                            <span className="text-[11px] font-mono text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                                {tasks.length} Sprints / Tasks
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {project?.description || "This project workspace houses all deliverables, subtasks, media attachments, and milestone progress. Select any task below to review its requirements or add a new task."}
                        </p>
                    </div>

                    {/* All tasks quick cards */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-200">Project Tasks ({tasks.length})</h3>
                            <button
                                type="button"
                                onClick={() => openAddTaskModal("to-do")}
                                className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                            >
                                + Add Task
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {filteredTasks.map((t) => (
                                <div
                                    key={t._id || t.id}
                                    onClick={() => setSelectedTask(t)}
                                    className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 hover:border-violet-500/40 hover:bg-slate-800/40 transition cursor-pointer space-y-3 group shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                                            {t.key}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${t.status === "completed"
                                            ? "bg-emerald-500/15 text-emerald-300"
                                            : t.status === "in-progress"
                                                ? "bg-blue-500/15 text-blue-300"
                                                : "bg-rose-500/15 text-rose-300"
                                            }`}>
                                            {t.status}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-violet-300 transition truncate">
                                            {t.name}
                                        </h4>
                                        {t.description && (
                                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                                                {t.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Thumbnail Preview on Card if image exists */}
                                    {t.files && t.files.length > 0 && isImageFile(t.files[0]?.fileUrl) && (
                                        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-950">
                                            <img
                                                src={getSafeImageUrl(t.files[0].fileUrl, 400)}
                                                alt={t.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                                        <span>{t.assignee?.fullName || "Unassigned"}</span>
                                        {t.dueDate && <span className="font-mono">{t.dueDate}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. BOARD VIEW */}
            {activeTab === "BOARD" && (
                <Board
                    tasks={filteredTasks}
                    loading={loadingTasks}
                    onSelectTask={(task) => setSelectedTask(task)}
                    onAddTask={(status) => openAddTaskModal(status)}
                />
            )}

            {/* 3. LIST VIEW */}
            {activeTab === "LIST" && (
                <TaskListView
                    tasks={filteredTasks}
                    onSelectTask={(task) => setSelectedTask(task)}
                />
            )}

            {/* 4. MEDIA GALLERY VIEW */}
            {activeTab === "MEDIA" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-100">Project Media & Image Assets</h3>
                            <p className="text-xs text-slate-400">All visual uploads and attachments stored across this project</p>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                            {allAttachments.length} Assets Found
                        </span>
                    </div>

                    {allAttachments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allAttachments.map((item, idx) => (
                                <div
                                    key={item.fileUrl || idx}
                                    className="group rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 overflow-hidden shadow-lg hover:border-violet-500/50 transition-all duration-300 flex flex-col"
                                >
                                    <div
                                        onClick={() => isImageFile(item.fileUrl) && setLightboxImage({ url: item.fileUrl, name: item.filename })}
                                        className="relative w-full h-48 bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
                                    >
                                        {isImageFile(item.fileUrl) ? (
                                            <>
                                                <img
                                                    src={getSafeImageUrl(item.fileUrl, 600)}
                                                    alt={item.filename}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="p-2 rounded-xl bg-violet-600 text-white shadow-lg">
                                                        <Maximize2 className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <Paperclip className="w-8 h-8 text-violet-400 mx-auto" />
                                                <p className="text-[11px] text-slate-400 mt-2 truncate max-w-[160px]">
                                                    {item.filename}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 bg-slate-900/90 flex items-center justify-between text-xs">
                                        <div className="min-w-0 pr-2">
                                            <p className="font-semibold text-slate-200 truncate text-[11px]">
                                                {item.filename || `File-${idx + 1}`}
                                            </p>
                                            {item.taskName && (
                                                <p className="text-[10px] text-slate-400 truncate">
                                                    Task: {item.taskName}
                                                </p>
                                            )}
                                        </div>

                                        <a
                                            href={getSafeImageUrl(item.fileUrl, 1800)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white transition shrink-0"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)]/40 space-y-2">
                            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                            <h4 className="text-sm font-bold text-slate-300">No media attachments found</h4>
                            <p className="text-xs text-slate-500">Upload images or files when creating tasks to see them here.</p>
                        </div>
                    )}
                </div>
            )}

            {/* 5. METRICS TAB */}
            {activeTab === "METRICS" && (
                <div className="space-y-6 max-w-5xl mx-auto">
                    <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 space-y-5 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-100">Sprint Workload & Status Breakdown</h3>
                                <p className="text-xs text-slate-400">Execution distribution for {project?.name || "this project"}</p>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                {metrics.rate}% Complete
                            </span>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <div className="flex justify-between font-semibold text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed Tasks
                                    </span>
                                    <span className="text-emerald-400">{metrics.completed} ({metrics.completedPct}%)</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${metrics.completedPct}%` }}></div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between font-semibold text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-blue-400" /> In Active Development
                                    </span>
                                    <span className="text-blue-400">{metrics.inProgress} ({metrics.inProgressPct}%)</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${metrics.inProgressPct}%` }}></div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between font-semibold text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> Backlog & To Do
                                    </span>
                                    <span className="text-slate-400">{metrics.todo} ({metrics.todoPct}%)</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                    <div className="h-full bg-slate-500 rounded-full transition-all duration-500" style={{ width: `${metrics.todoPct}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Urgent</span>
                            <p className="text-xl font-bold text-rose-400 mt-1">{metrics.urgent}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">High</span>
                            <p className="text-xl font-bold text-amber-400 mt-1">{metrics.high}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Medium</span>
                            <p className="text-xl font-bold text-indigo-400 mt-1">{metrics.medium}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Low</span>
                            <p className="text-xl font-bold text-slate-300 mt-1">{metrics.low}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* LIGHTBOX MODAL (Image Full Screen Preview) */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-2 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-3 border-b border-slate-800">
                            <span className="text-xs font-semibold text-slate-200 truncate">
                                {lightboxImage.name || "Attachment Preview"}
                            </span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={getSafeImageUrl(lightboxImage.url, 1800)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                    title="Open Original"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setLightboxImage(null)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-2 flex items-center justify-center overflow-auto max-h-[75vh]">
                            <img
                                src={getSafeImageUrl(lightboxImage.url, 1800)}
                                alt={lightboxImage.name || "Preview"}
                                className="max-w-full max-h-[72vh] object-contain rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            <PopupModel
                open={taskPopup}
                onOpenChange={setTaskPopup}
                title="Create Task"
                description={`Add a new task directly into "${project?.name || "Project"}"`}
                icon={<Sparkles className="w-5 h-5 text-indigo-500" />}
                maxWidth="max-w-xl"
            >
                <div className="space-y-2">
                    <CardContent className="space-y-4 text-xs">
                        <form id="form-create-project-task" onSubmit={form.handleSubmit(onSubmitTask)}>
                            <FieldGroup>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Controller
                                        name="name"
                                        control={form.control}
                                        rules={{ required: "Task name is required" }}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className="input-label" htmlFor="task-title-input">
                                                    Task Name <span className="text-rose-500">*</span>
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className="input"
                                                    id="task-title-input"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="Enter task name"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="files"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className="input-label" htmlFor="task-file-input">
                                                    Image / File Attachment
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className="input file:hidden"
                                                    type="file"
                                                    id="task-file-input"
                                                    aria-invalid={fieldState.invalid}
                                                    value={undefined}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.files?.[0] || null);
                                                    }}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Controller
                                        name="status"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className="input-label" htmlFor="task-status-input">
                                                    Status
                                                </FieldLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="select" id="task-status-input">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {TaskStatus.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="priority"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className="input-label" htmlFor="task-priority-input">
                                                    Priority
                                                </FieldLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="select" id="task-priority-input">
                                                        <SelectValue placeholder="Select Priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {TaskPriority.map((item) => (
                                                                <SelectItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Controller
                                        name="dueDate"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className="input-label" htmlFor="task-due-input">
                                                    Due Date
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    type="date"
                                                    className="input"
                                                    id="task-due-input"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="assignee"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className="input-label" htmlFor="task-assignee-input">
                                                    Assignee Email
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className="input"
                                                    id="task-assignee-input"
                                                    placeholder="colleague@taskflow.dev"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    name="description"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="input-label mt-2" htmlFor="task-desc-input">
                                                Description
                                            </FieldLabel>
                                            <Textarea
                                                {...field}
                                                style={{ width: "100%" }}
                                                className="input text-xs"
                                                placeholder="Task details, requirements..."
                                                id="task-desc-input"
                                                rows={3}
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </CardContent>

                    <CardFooter>
                        <Field orientation="horizontal" className="flex items-center justify-between w-full mt-2">
                            <Button type="button" variant="outline" onClick={() => form.reset()}>
                                Reset
                            </Button>
                            <Button type="submit" form="form-create-project-task">
                                Create Task
                            </Button>
                        </Field>
                    </CardFooter>
                </div>
            </PopupModel>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />

            {/* Task Detail Modal */}
            <PopupModel
                open={Boolean(selectedTask)}
                onOpenChange={(open) => !open && setSelectedTask(null)}
                title={selectedTask?.name || "Task Details"}
                description={`Task ${selectedTask?.key || ""} in ${project?.name || "Project"}`}
                icon={<Layers className="w-5 h-5 text-violet-400" />}
                maxWidth="max-w-2xl"
            >
                {selectedTask && (
                    <div className="space-y-4 p-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${selectedTask.status === "completed"
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : selectedTask.status === "in-progress"
                                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                    : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                }`}>
                                {selectedTask.status}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                {selectedTask.priority} PRIORITY
                            </span>
                            {selectedTask.assignee?.fullName && (
                                <span className="text-slate-400">
                                    Assignee: <b className="text-slate-200">{selectedTask.assignee.fullName}</b>
                                </span>
                            )}
                            {selectedTask.dueDate && (
                                <span className="text-slate-400 font-mono">
                                    Due: <b className="text-slate-200">{selectedTask.dueDate}</b>
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Description</h4>
                            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {selectedTask.description || "No description provided for this task."}
                            </div>
                        </div>

                        {selectedTask.files && selectedTask.files.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-violet-400" /> Attached Media ({selectedTask.files.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedTask.files.map((file, i) => {
                                        const isImg = isImageFile(file.fileUrl);
                                        return (
                                            <div key={i} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group">
                                                {isImg && (
                                                    <div
                                                        onClick={() => setLightboxImage({ url: file.fileUrl, name: file.filename })}
                                                        className="h-32 bg-slate-950 overflow-hidden cursor-pointer"
                                                    >
                                                        <img
                                                            src={getSafeImageUrl(file.fileUrl, 600)}
                                                            alt={file.filename}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-2 flex items-center justify-between text-xs">
                                                    <span className="truncate max-w-[150px] text-slate-300">{file.filename || "Attachment"}</span>
                                                    <a
                                                        href={getSafeImageUrl(file.fileUrl, 1800)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-violet-400 hover:text-violet-300 text-[11px] font-semibold"
                                                    >
                                                        Open
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </PopupModel>

            {/* Edit Project Modal */}
            <PopupModel
                open={editProjectModal}
                onOpenChange={setEditProjectModal}
                title="Edit Project"
                description={`Update project details and configuration`}
                icon={<Pencil className="w-5 h-5 text-violet-400" />}
                maxWidth="max-w-lg"
            >
                <div className="space-y-4">
                    <CardContent className="space-y-4 text-xs pt-2">
                        <form id="form-edit-project-dedicated" onSubmit={editProjectForm.handleSubmit(onSubmitUpdateProject)}>
                            <FieldGroup className="space-y-3.5">
                                <Controller
                                    name="name"
                                    control={editProjectForm.control}
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

                                {spacesList.length > 0 && (
                                    <Controller
                                        name="spaceId"
                                        control={editProjectForm.control}
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
                                                            {spacesList.map((space) => (
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
                                )}

                                <Controller
                                    name="description"
                                    control={editProjectForm.control}
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
                                    control={editProjectForm.control}
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
                            <Button type="submit" form="form-edit-project-dedicated" disabled={isUpdatingProject}>
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
                                Deleting <span className="font-bold underline">{project?.name}</span> will permanently remove this project and all of its tasks. You will be redirected to the projects directory.
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