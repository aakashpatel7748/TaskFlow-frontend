"use client";

import React, { useState } from "react";
import {
    Plus,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Clock3,
    CircleDashed,
    Calendar,
    ArrowUpDown,
    Paperclip,
    Flame,
    AlertCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    User,
    Eye
} from "lucide-react";
import TanStackTable, { features } from "../table/TanStackTable";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export interface TaskItem {
    _id?: string;
    id?: string;
    name?: string;
    title?: string;
    description: string;
    status: string;
    rawStatus?: string;
    priority: string;
    rawPriority?: string;
    tags?: string[];
    assignee: { fullName?: string; name?: string; email?: string; avatar?: string; fallback?: string };
    dueDate?: string;
    completedSubtasks?: number;
    totalSubtasks?: number;
    commentsCount?: number;
    attachmentsCount?: number;
    files?: Array<{ filename: string; fileUrl: string }>;
    key: string;
    projectId?: any;
    raw?: any;
}

const sections = [
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

interface BoardProps {
    tasks: TaskItem[];
    loading?: boolean;
    onSelectTask: (task: TaskItem) => void;
    onAddTask: (status: string) => void;
}

export default function Board({ tasks, loading = false, onSelectTask, onAddTask }: BoardProps) {
    const navigate = useRouter();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        "to-do": true,
        "in-progress": true,
        "completed": true
    });


    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getPriorityBadge = (priority: string) => {
        const p = (priority || "").toLowerCase();
        if (p === "urgent") {
            return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 text-[13px]"><Flame className="w-3 h-3" /> Urgent</span>;
        }
        if (p === "high") {
            return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 text-[13px]"><AlertCircle className="w-3 h-3" /> High</span>;
        }
        if (p === "medium") {
            return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 text-[13px]"><ArrowUpCircle className="w-3 h-3" /> Medium</span>;
        }
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 text-[13px]"><ArrowDownCircle className="w-3 h-3" /> Low</span>;
    };

    const columns: Array<ColumnDef<typeof features, TaskItem>> = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <button
                    type="button"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="flex items-center gap-1.5 hover:text-slate-200 transition"
                >
                    <span >Task Name</span>
                    <ArrowUpDown className="w-[22px] h-[22px] opacity-60" />
                </button>
            ),
            cell: (info) => {
                const { name } = info.row.original;
                return (
                    <div className="flex items-start gap-2.5 py-1">
                        <div className="min-w-0 space-y-0.5">
                            <h4 className="text-[13px] font-bold text-slate-100 hover:text-violet-300 transition truncate text-sm">
                                {name}
                            </h4>

                            {/* <div className="flex items-center gap-2 pt-0.5">
                                {task.files && task.files.length > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-violet-400 font-mono">
                                        <Paperclip className="w-3 h-3" /> {task.files.length} file{task.files.length > 1 ? "s" : ""}
                                    </span>
                                )}
                                {task.tags && task.tags.map(tag => (
                                    <span key={tag} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                        #{tag}
                                    </span>
                                ))}
                            </div> */}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <span>Description</span>
            ),
            cell: (info) => {
                const { description } = info.row.original;
                return (
                    <div className="flex items-start gap-2.5 py-1">
                        <div className="min-w-0 space-y-0.5">
                            <h4 className="text-[13px] font-bold text-slate-100 hover:text-violet-300 transition truncate text-xs">
                                {description}
                            </h4>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'priority',
            header: () => 'Priority',
            cell: (info) => {
                const { priority } = info.row.original;
                return getPriorityBadge(priority);
            }
        },
        {
            accessorKey: 'assignee',
            header: () => 'Assignee',
            cell: (info) => {
                const { assignee } = info.row.original;
                const displayName = assignee?.fullName || assignee?.name || "Unassigned";
                const initial = displayName !== "Unassigned" ? displayName.split(" ")[0][0]?.toUpperCase() : "U";
                return (
                    <div className="flex items-center gap-2">
                        {assignee?.avatar ? (
                            <img src={assignee.avatar} alt={displayName} className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                                {initial}
                            </div>
                        )}
                        <span className="text-[13px] text-slate-300 truncate max-w-[130px]">{displayName}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'dueDate',
            header: () => 'Due Date',
            cell: (info) => {
                const { dueDate } = info.row.original;
                return (
                    <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
                        <Calendar className="w-2 h-2 text-slate-500" />
                        <span className="text-[13px] font-semibold">{dueDate?.split('T')[0] || "No date"}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'View',
            header: () => 'View',
            cell: (info) => {
                const item = info.row.original;
                const targetId = item._id || item.id || (typeof item?.projectId === 'object' ? item?.projectId?._id : item?.projectId);
                return (
                    <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (targetId) {
                                    navigate.push(`/tasks/projects/${targetId}`);
                                }
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-violet-400 transition cursor-pointer"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                );
            }
        },
    ];

    return (
        <div className="w-full max-w-full space-y-4 select-none pb-8 text-[var(--foreground)]">
            {sections.map((sec) => {
                const sectionTasks = tasks.filter(t => t.status === sec.id);
                const isExpanded = expandedSections[sec.id] !== false;
                const IconComponent = sec.icon;

                return (
                    <div
                        key={sec.id}
                        className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 shadow-xl overflow-hidden p-4 space-y-3"
                    >
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => toggleSection(sec.id)}
                                    className="p-1 rounded-lg hover:bg-[var(--background)]/50 text-[var(--foreground)] transition cursor-pointer"
                                >
                                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>

                                {/* Status Pill Badge */}
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sec.pillBg}`}>
                                    <IconComponent className="w-3 h-3" />
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
                                    onClick={() => onAddTask(sec.id)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                                    title="Add task to this column"
                                >
                                    <Plus className="w-3 h-3 text-violet-400" />
                                    <span className="hidden sm:inline">Add</span>
                                </button>
                            </div>
                        </div>

                        {/* Expanded Section Body with Table */}
                        {isExpanded && (
                            <div className="pt-2 overflow-x-auto w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                <TanStackTable
                                    data={sectionTasks}
                                    columns={columns}
                                    emptyMessage={`No ${sec.title.toLowerCase()} tasks found.`}
                                    onRowClick={(item) => onSelectTask(item)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
