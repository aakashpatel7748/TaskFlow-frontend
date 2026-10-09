"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    CheckSquare,
    CheckSquare2,
    FolderKanban,
    List,
    BarChart3,
    Plus,
    RefreshCw,
    Search,
    Calendar,
    Flame,
    AlertCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    CheckCircle2,
    Clock,
    Clock3,
    CircleDashed,
    Layers,
    FolderGit2,
    Paperclip,
    Eye,
    ChevronDown,
    ChevronRight,
    ArrowUpDown,
    User,
    Sparkles,
    X,
    Filter
} from "lucide-react";
import TanStackTable, { features } from "@/components/table/TanStackTable";
import type { ColumnDef } from "@tanstack/react-table";
import TaskDetailDrawer from "@/components/tasks/TaskDetailDrawer";
import TaskListView from "@/components/tasks/TaskListView";
import { TaskItem } from "@/components/tasks/Board";
import PopupModel from "@/components/tasks/PopupModel";
import { getTasksAPI, createTaskAPI } from "@/services/opreations/tasks";
import { getAllProjectsAPI } from "@/services/opreations/project";
import { Controller, useForm } from "react-hook-form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import PageTitleCard from "@/components/card/PageTitleCard";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TaskPriority, TaskStatus } from "@/components/constant";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const boardSections = [
    {
        id: "to-do",
        title: "TO DO",
        icon: CircleDashed,
        pillBg: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
        dotColor: "text-rose-400",
    },
    {
        id: "in-progress",
        title: "IN PROGRESS",
        icon: Clock3,
        pillBg: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
        dotColor: "text-blue-400",
    },
    {
        id: "completed",
        title: "COMPLETED",
        icon: CheckCircle2,
        pillBg: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        dotColor: "text-emerald-400",
    }
];

export default function MyTasksPage() {
    const router = useRouter();

    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    // Active Navigation Tab: BOARD (default) | OVERVIEW | LIST | METRICS
    const [activeTab, setActiveTab] = useState<"BOARD" | "OVERVIEW" | "LIST" | "METRICS">("BOARD");

    // Collapsible sections state for Board rows
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        "to-do": true,
        "in-progress": true,
        "completed": true,
    });

    const toggleSection = (id: string) => {
        setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Selected task for detail drawer
    const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("ALL");
    const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>("ALL");

    // Modal state for Create Task
    const [taskPopup, setTaskPopup] = useState<boolean>(false);
    const [createDefaultStatus, setCreateDefaultStatus] = useState<string>("to-do");
    const [isSubmittingTask, setIsSubmittingTask] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // React Hook Form for Task Creation
    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            projectId: "",
            status: "to-do",
            priority: "medium",
            dueDate: "",
            files: "",
            assignee: ""
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

    // Normalizer for backend tasks
    const normalizeTask = useCallback((t: any): TaskItem => {
        const id = t._id || t.id || String(Math.random());
        const name = t.name || t.title || "Untitled Task";
        let status = (t.status || "to-do").toLowerCase().replace(/_/g, "-");
        if (status === "todo") status = "to-do";
        if (status === "done") status = "completed";

        const priority = (t.priority || "medium").toLowerCase();
        const assigneeObj = typeof t.assignee === "object" ? t.assignee : null;
        const assigneeName = assigneeObj?.fullName || assigneeObj?.username || t.assigneeEmail || "Assigned User";
        const assigneeEmail = assigneeObj?.email || t.assigneeEmail || "";
        const fallback = assigneeName.slice(0, 2).toUpperCase();

        const projObj = typeof t.projectId === "object" ? t.projectId : null;

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
            projectId: projObj || t.projectId,
            raw: t
        };
    }, []);

    // Fetch Tasks & Projects
    const fetchTasksAndProjects = useCallback(async () => {
        const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);
        try {
            setLoading(true);
            const [tasksRes, projectsRes] = await Promise.all([
                getTasksAPI().action(null, activeWs).catch(() => null),
                activeWs ? getAllProjectsAPI().action(activeWs).catch(() => null) : Promise.resolve(null)
            ]);

            if (tasksRes?.data?.data) {
                const rawTasks = tasksRes.data.data || [];
                const normalized = rawTasks.map(normalizeTask);
                setTasks(normalized);
            }

            if (projectsRes?.data?.data) {
                setProjects(projectsRes.data.data);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId, normalizeTask]);

    useEffect(() => {
        fetchTasksAndProjects();
    }, [fetchTasksAndProjects]);

    // Refresh Handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchTasksAndProjects();
        setIsRefreshing(false);
        toast.add({
            title: "Tasks Refreshed",
            description: "Your task queue has been updated successfully",
        });
    };

    // Filter Tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            const taskName = t.name || t.title || "";
            const taskDesc = t.description || "";
            const projectName = typeof t.projectId === "object" ? t.projectId?.name || "" : "";

            const matchesQuery =
                !searchQuery ||
                taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                taskDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.key.toLowerCase().includes(searchQuery.toLowerCase());

            const taskProjectId = typeof t.projectId === "object" ? t.projectId?._id : t.projectId;
            const matchesProject = selectedProjectFilter === "ALL" || taskProjectId === selectedProjectFilter;

            const matchesPriority = selectedPriorityFilter === "ALL" || t.priority === selectedPriorityFilter;

            return matchesQuery && matchesProject && matchesPriority;
        });
    }, [tasks, searchQuery, selectedProjectFilter, selectedPriorityFilter]);

    // Metrics & Calculations
    const metrics = useMemo(() => {
        const total = tasks.length;
        const inProgress = tasks.filter((t) => t.status === "in-progress").length;
        const todo = tasks.filter((t) => t.status === "to-do").length;
        const completed = tasks.filter((t) => t.status === "completed").length;

        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
        const todoPct = total > 0 ? Math.round((todo / total) * 100) : 0;

        const urgent = tasks.filter((t) => t.priority === "urgent").length;
        const high = tasks.filter((t) => t.priority === "high").length;
        const medium = tasks.filter((t) => t.priority === "medium").length;
        const low = tasks.filter((t) => t.priority === "low").length;

        return {
            total,
            inProgress,
            todo,
            completed,
            rate,
            completedPct,
            inProgressPct,
            todoPct,
            urgent,
            high,
            medium,
            low,
        };
    }, [tasks]);

    // Open Create Task Modal with preselected status
    const openAddTaskModal = (defaultStatus = "to-do") => {
        setCreateDefaultStatus(defaultStatus);
        form.setValue("status", defaultStatus);
        if (projects.length > 0) {
            form.setValue("projectId", projects[0]._id);
        }
        setTaskPopup(true);
    };

    // Handle Create Task Submit
    const onSubmitTask = async (data: any) => {
        if (!data.name.trim()) {
            toast.add({
                title: "Title Required",
                description: "Please enter a task title",
            });
            return;
        }

        try {
            setIsSubmittingTask(true);
            const activeWs = workspaceId || (typeof window !== "undefined" ? localStorage.getItem("selectedWorkspaceId") : null);

            const formData = new FormData();
            formData.append("name", data.name.trim());
            formData.append("description", data.description || "");
            formData.append("status", data.status || createDefaultStatus || "to-do");
            formData.append("priority", data.priority || "medium");
            if (data.dueDate) formData.append("dueDate", data.dueDate);
            if (data.projectId && data.projectId !== "none") formData.append("projectId", data.projectId);
            if (activeWs) formData.append("workspaceId", activeWs);
            if (selectedFile) formData.append("files", selectedFile);

            const res = await createTaskAPI().action(formData);
            if (res?.status === 200 || res?.status === 201) {
                toast.add({
                    title: "Task Created",
                    description: `Task "${data.name}" created successfully!`,
                });
                setTaskPopup(false);
                setSelectedFile(null);
                form.reset();
                fetchTasksAndProjects();
            }
        } catch (error: any) {
            console.error("Create task error:", error);
            toast.add({
                title: "Creation Error",
                description: error?.response?.data?.message || "Could not create task",
            });
        } finally {
            setIsSubmittingTask(false);
        }
    };

    // Priority Badge Helper
    const getPriorityBadge = (priority: string) => {
        const p = (priority || "").toLowerCase();
        if (p === "urgent") {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                    <Flame className="w-3.5 h-3.5" /> Urgent
                </span>
            );
        }
        if (p === "high") {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" /> High
                </span>
            );
        }
        if (p === "medium") {
            return (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> Medium
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <ArrowDownCircle className="w-3.5 h-3.5" /> Low
            </span>
        );
    };

    // TanStackTable Column Definitions for Section Tasks
    const tableColumns: Array<ColumnDef<typeof features, TaskItem>> = useMemo(
        () => [

            {
                accessorKey: "s/no",
                header: "S/No",
                cell: (info) => {
                    const item = info.row.original;
                    return (
                        <span className="text-xs font-bold text-slate-100 hover:text-violet-300 transition truncate max-w-sm">
                            {info.row.index + 1}
                        </span>
                    );
                },
            },
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <button
                        type="button"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="flex items-center gap-1.5 hover:text-slate-200 transition"
                    >
                        <span>Task Name</span>
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                ),
                cell: (info) => {
                    const item = info.row.original;
                    return (
                        <div className="flex items-start gap-2.5 py-1">
                            <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2">

                                    <h4 className="text-xs font-bold text-slate-100 hover:text-violet-300 transition truncate max-w-sm">
                                        {item.name}
                                    </h4>
                                </div>

                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "description",
                header: () => <span>Description</span>,
                cell: (info) => {
                    const { description } = info.row.original;
                    return (
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-md">
                            {description || "—"}
                        </p>
                    );
                },
            },
            {
                id: "project",
                header: () => "Project",
                cell: (info) => {
                    const proj = info.row.original.projectId;
                    const projName = typeof proj === "object" ? proj?.name : "General Task";
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[11px] font-bold border border-violet-500/20 whitespace-nowrap">
                            <FolderKanban className="w-3 h-3" />
                            {projName}
                        </span>
                    );
                },
            },
            {
                accessorKey: "priority",
                header: () => "Priority",
                cell: (info) => getPriorityBadge(info.row.original.priority),
            },
            {
                accessorKey: "assignee",
                header: () => "Assignee",
                cell: (info) => {
                    const { assignee } = info.row.original;
                    const displayName = assignee?.fullName || assignee?.name || "Assigned";
                    const initial = assignee?.fallback || displayName.slice(0, 1).toUpperCase();
                    return (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            {assignee?.avatar ? (
                                <img src={assignee.avatar} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                                    {initial}
                                </div>
                            )}
                            <span className="text-xs text-slate-300 truncate max-w-[120px]">{displayName}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "dueDate",
                header: () => "Due Date",
                cell: (info) => {
                    const { dueDate } = info.row.original;
                    return (
                        <div className="flex items-center gap-1.5 font-mono text-slate-400 text-xs whitespace-nowrap">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{dueDate ? dueDate.split("T")[0] : "No date"}</span>
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: () => <div className="text-right">Action</div>,
                cell: (info) => {
                    const item = info.row.original;
                    return (
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={() => setSelectedTask(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-violet-400 transition cursor-pointer"
                                title="View Details"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    );
                },
            },
        ],
        []
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 select-none text-[var(--foreground)] pb-16">
            <PageTitleCard
                title="My Tasks"
                description="Manage deliverables, track sprint progress across all connected projects, and update task workflows."
                icon={<CheckSquare className="w-5 h-5" />}
                action={<div className="flex items-center gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-secondary-light)] text-secondary text-xs font-semibold shadow-sm transition cursor-pointer"
                        title="Refresh Tasks"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => openAddTaskModal("to-do")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                    </button>
                </div>}
            />

            {/* 2. QUICK METRICS BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1.5">
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

                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Tasks
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-slate-100">{metrics.total}</span>
                        <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Queue
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                        {metrics.todo} Backlog / To Do
                    </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1.5">
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

                <div className="p-3.5 rounded-xl bg-[var(--card)]  shadow-sm space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Projects Involved
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-amber-400">{projects.length}</span>
                        <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-0.5">
                            <FolderKanban className="w-3 h-3 text-amber-400" /> Projects
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                        Across active workspace
                    </p>
                </div>
            </div>

            {/* 3. NAVIGATION TABS BAR (BOARD | OVERVIEW | LIST | METRICS) + FILTERS */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[var(--card)] p-2 rounded-2xl  shadow-sm">
                {/* 4 Options Tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--color-secondary-light)]   text-xs overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("BOARD")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "BOARD"
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
                        onClick={() => setActiveTab("OVERVIEW")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "OVERVIEW"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <CheckSquare2 className="w-3.5 h-3.5" />
                        <span>Overview</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("LIST")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "LIST"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        <span>List</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("METRICS")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "METRICS"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Analyze & Metrics</span>
                    </button>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-wrap items-center gap-2">


                    {/* Project Filter */}
                    <div>
                        <Select value={selectedProjectFilter} onValueChange={(val) => setSelectedProjectFilter(val || "ALL")}>
                            <SelectTrigger style={{ borderRadius: "8px" }} className="text-xs h-10 px-2.5 rounded-md   text-slate-300 min-w-[130px]">
                                <SelectValue placeholder="All Projects" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectGroup>
                                    <SelectItem value="ALL">All Projects</SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p._id} value={p._id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        {/* Priority Filter */}
                        <Select value={selectedPriorityFilter} onValueChange={(val) => setSelectedPriorityFilter(val || "ALL")}>
                            <SelectTrigger style={{ borderRadius: "8px" }} className="text-xs h-10 px-2.5   text-slate-300 min-w-[110px]">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectGroup>
                                    <SelectItem value="ALL">All Priority</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative w-full sm:w-40 ">
                        <Search className="absolute left-2  top-1/2  -translate-y-1/2 w-3.5 h-3.5 text-slate-500 " />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input "
                            style={{ paddingLeft: "25px" }}
                        />
                    </div>
                </div>
            </div>

            {/* Active Filter Banner */}
            {(selectedProjectFilter !== "ALL" || selectedPriorityFilter !== "ALL" || searchQuery) && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#2b2c47]  text-xs shadow-md">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-400">Filtering by:</span>
                        {selectedProjectFilter !== "ALL" && (
                            <span className="font-bold text-violet-300 bg-violet-500/15 px-2.5 py-0.5 rounded-full border border-violet-500/30 flex items-center gap-1">
                                Project: {projects.find((p) => p._id === selectedProjectFilter)?.name || "Selected"}
                            </span>
                        )}
                        {selectedPriorityFilter !== "ALL" && (
                            <span className="font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                                Priority: {selectedPriorityFilter}
                            </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">
                            ({filteredTasks.length} tasks matched)
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedProjectFilter("ALL");
                            setSelectedPriorityFilter("ALL");
                            setSearchQuery("");
                        }}
                        className="text-xs text-violet-400 hover:text-violet-200 font-semibold hover:underline cursor-pointer"
                    >
                        Clear Filters ✕
                    </button>
                </div>
            )}

            {/* 4. TAB CONTENTS */}

            {/* TAB 1: BOARD VIEW (3 Collapsible Rows: TO DO, IN PROGRESS, COMPLETED) */}
            {activeTab === "BOARD" && (
                <div className="w-full space-y-4">
                    {boardSections.map((sec) => {
                        const sectionTasks = filteredTasks.filter((t) => t.status === sec.id);
                        const isExpanded = expandedSections[sec.id] !== false;
                        const IconComponent = sec.icon;

                        return (
                            <div
                                key={sec.id}
                                className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 shadow-xl overflow-hidden p-4 space-y-3"
                            >
                                {/* Collapsible Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleSection(sec.id)}
                                            className="p-1 rounded-lg hover:bg-[var(--background)]/50 text-[var(--foreground)] transition cursor-pointer"
                                        >
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>

                                        {/* Status Pill Badge */}
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sec.pillBg}`}>
                                            <IconComponent className="w-3.5 h-3.5" />
                                            <span>{sec.title}</span>
                                        </div>

                                        {/* Task Count */}
                                        <span className="text-xs font-mono font-bold text-slate-400">
                                            {sectionTasks.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openAddTaskModal(sec.id)}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                                            title={`Add task to ${sec.title}`}
                                        >
                                            <Plus className="w-3 h-3 text-violet-400" />
                                            <span className="hidden sm:inline">Add</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Collapsible Body: Table of Tasks */}
                                {isExpanded && (
                                    <div className="pt-2 overflow-x-auto w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                        <TanStackTable
                                            data={sectionTasks}
                                            columns={tableColumns}
                                            emptyMessage={`No ${sec.title.toLowerCase()} tasks found in your queue.`}
                                            onRowClick={(item) => setSelectedTask(item)}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TAB 2: OVERVIEW VIEW */}
            {activeTab === "OVERVIEW" && (
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-[var(--card)]  shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-400" />
                                <h3 className="text-sm font-bold text-secondary">Task Scope & Objectives</h3>
                            </div>
                            <span className="text-[11px] font-mono text-secondary bg-violet-500/10 px-2.5 py-0.5 rounded-full ">
                                {tasks.length} Total Deliverables
                            </span>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed">
                            This personal task workspace consolidates all your active responsibilities across projects. Use the Board view to collapse or expand sprint columns, or check the Metrics tab to track your completion velocity.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-200">All Queue Tasks ({filteredTasks.length})</h3>
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
                                    className="p-4 rounded-2xl bg-[var(--card)]  hover:border-violet-500/40 hover:bg-slate-800/40 transition cursor-pointer space-y-3 group shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                                            {t.key}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${t.status === "completed"
                                                ? "bg-emerald-500/15 text-emerald-300"
                                                : t.status === "in-progress"
                                                    ? "bg-blue-500/15 text-blue-300"
                                                    : "bg-rose-500/15 text-rose-300"
                                                }`}
                                        >
                                            {t.status}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-secondary group-hover:text-violet-300 transition truncate">
                                            {t.name}
                                        </h4>
                                        {t.description && (
                                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                                                {t.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                                        <span>{t.assignee?.fullName || "Assigned User"}</span>
                                        {t.dueDate && <span className="font-mono">{t.dueDate}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: LIST VIEW */}
            {activeTab === "LIST" && (
                <TaskListView
                    tasks={filteredTasks}
                    onSelectTask={(task) => setSelectedTask(task)}
                />
            )}

            {/* TAB 4: METRICS & ANALYZE TAB */}
            {activeTab === "METRICS" && (
                <div className="space-y-6 max-w-5xl mx-auto">
                    <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 space-y-5 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-100">Workload & Status Velocity</h3>
                                <p className="text-xs text-slate-400">Execution distribution of your assigned tasks</p>
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
                                        <CircleDashed className="w-3.5 h-3.5 text-rose-400" /> Backlog & To Do
                                    </span>
                                    <span className="text-rose-400">{metrics.todo} ({metrics.todoPct}%)</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${metrics.todoPct}%` }}></div>
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

            {/* TASK DETAIL DRAWER */}
            <TaskDetailDrawer
                task={selectedTask}
                projectName={typeof selectedTask?.projectId === "object" ? selectedTask?.projectId?.name : "Workspace Project"}
                onClose={() => setSelectedTask(null)}
            />

            {/* CREATE TASK MODAL */}
            {/* <PopupModel
                open={createTaskModal}
                onOpenChange={setCreateTaskModal}
                title="Create New Task"
                description="Add a task, set its priority, due date, and assign it to a workspace project."
                icon={<CheckSquare className="w-5 h-5 text-violet-400" />}
                maxWidth="max-w-xl"
            >
                <form onSubmit={form.handleSubmit(onSubmitCreateTask)} className="space-y-4">
                   
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                            Task Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Implement OAuth social sign-in flow"
                            {...form.register("name", { required: true })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition"
                        />
                    </div>

                  
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Description</label>
                        <textarea
                            rows={3}
                            placeholder="Detail requirements, milestones, or instructions..."
                            {...form.register("description")}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition resize-none"
                        />
                    </div>

                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">Assign to Project</label>
                            <Controller
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="text-xs h-10 px-3.5 bg-slate-900/80 border-slate-700/80 text-white w-full">
                                            <SelectValue placeholder="Select Project" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectGroup>
                                                {projects.map((p) => (
                                                    <SelectItem key={p._id} value={p._id}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">Due Date</label>
                            <input
                                type="date"
                                {...form.register("dueDate")}
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-violet-500 transition h-10"
                            />
                        </div>
                    </div>

                  
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">Status</label>
                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="text-xs h-10 px-3.5 bg-slate-900/80 border-slate-700/80 text-white w-full">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectGroup>
                                                <SelectItem value="to-do">To Do</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">Priority</label>
                            <Controller
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="text-xs h-10 px-3.5 bg-slate-900/80 border-slate-700/80 text-white w-full">
                                            <SelectValue placeholder="Select Priority" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectGroup>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                  
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Attachment (Optional)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                id="task-file-upload-modal"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setSelectedFile(e.target.files[0]);
                                    }
                                }}
                            />
                            <label
                                htmlFor="task-file-upload-modal"
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white cursor-pointer transition font-medium"
                            >
                                <Paperclip className="w-3.5 h-3.5 text-violet-400" />
                                <span>{selectedFile ? selectedFile.name : "Attach a file or image"}</span>
                            </label>
                            {selectedFile && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="text-slate-400 hover:text-rose-400 text-xs p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
                        <button
                            type="button"
                            onClick={() => setCreateTaskModal(false)}
                            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmittingTask}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-600/25 transition disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmittingTask ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create Task</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </PopupModel> */}

            {/* Create Task Modal */}
            <PopupModel
                open={taskPopup}
                onOpenChange={setTaskPopup}
                title="Create Task"
                description={`Add a new Task"`}
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
                                                style={{ width: "95%" }}
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
                                {isSubmittingTask ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Create Task</span>
                                    </>
                                )}
                            </Button>
                        </Field>
                    </CardFooter>
                </div>
            </PopupModel>
        </div>
    );
}
