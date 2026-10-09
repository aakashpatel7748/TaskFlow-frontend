"use client";

import React, { useState } from "react";
import { TaskItem } from "./Board";
import {
    Search,
    Flame,
    AlertCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    Calendar,
    Paperclip,
    Eye
} from "lucide-react";

interface TaskListViewProps {
    tasks: TaskItem[];
    onSelectTask: (task: TaskItem) => void;
}

export default function TaskListView({ tasks, onSelectTask }: TaskListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const normalizeStatus = (st?: string) => {
        const s = (st || "").toLowerCase().replace("_", "-");
        if (s === "to-do" || s === "todo" || s === "not started") return "to-do";
        if (s === "in-progress" || s === "inprogress" || s === "under_review" || s === "under review") return "in-progress";
        if (s === "completed" || s === "done") return "completed";
        return s;
    };

    const filteredTasks = tasks.filter(t => {
        const query = searchQuery.toLowerCase();
        const taskTitle = t.title || t.name || "";
        const assigneeName = t.assignee?.fullName || t.assignee?.name || "";
        const matchesQuery = !query ||
            taskTitle.toLowerCase().includes(query) ||
            (t.key && t.key.toLowerCase().includes(query)) ||
            (t.description && t.description.toLowerCase().includes(query)) ||
            assigneeName.toLowerCase().includes(query);

        const normalized = normalizeStatus(t.status || t.rawStatus);
        const matchesStatus = statusFilter === "ALL" || normalized === statusFilter;
        return matchesQuery && matchesStatus;
    });

    const getStatusPill = (status?: string) => {
        const s = normalizeStatus(status);
        switch (s) {
            case "to-do":
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25">To Do</span>;
            case "in-progress":
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25">In Progress</span>;
            case "completed":
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">Completed</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">{status || "Pending"}</span>;
        }
    };

    const getPriorityBadge = (priority?: string) => {
        const p = (priority || "").toLowerCase();
        switch (p) {
            case "urgent":
                return <span className="text-rose-400 font-bold flex items-center gap-1"><Flame className="w-3 h-3" /> Urgent</span>;
            case "high":
                return <span className="text-amber-400 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> High</span>;
            case "medium":
                return <span className="text-indigo-400 font-semibold flex items-center gap-1"><ArrowUpCircle className="w-3 h-3" /> Medium</span>;
            case "low":
            default:
                return <span className="text-slate-400 font-medium flex items-center gap-1"><ArrowDownCircle className="w-3 h-3" /> Low</span>;
        }
    };

    const filterOptions = [
        { id: "ALL", label: "All Tasks" },
        { id: "to-do", label: "To Do" },
        { id: "in-progress", label: "In Progress" },
        { id: "completed", label: "Completed" }
    ];

    return (
        <div className="p-6 space-y-4">
            {/* Filter Header */}
            <div className="flex flex-col md:flex-row gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)]/40 shadow-sm">
                <div className="flex  items-center justify-between gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by title, ID, assignee..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input"
                            style={{ paddingLeft: "2rem" }}
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-[var(--color-secondary-light)] p-2">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setStatusFilter(opt.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${statusFilter === opt.id
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* List Table */}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)]/40 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[var(--background)] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-[var(--border)]/40 select-none">
                        <tr>
                            <th className="py-3.5 px-4">Task</th>
                            <th className="py-3.5 px-3">Status</th>
                            <th className="py-3.5 px-3">Priority</th>
                            <th className="py-3.5 px-3">Assignee</th>
                            <th className="py-3.5 px-3">Due Date</th>
                            <th className="py-3.5 px-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]/40 font-medium">
                        {filteredTasks.map((t) => (
                            <tr
                                key={t.id}
                                onClick={() => onSelectTask(t)}
                                className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                            >
                                <td className="py-3.5 px-4">
                                    <div className="flex items-start gap-2.5">
                                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 shrink-0 mt-0.5">
                                            {t.key}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
                                                {t.title}
                                            </p>
                                            {t.description && (
                                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                                    {t.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {t.files && t.files.length > 0 && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                        <Paperclip className="w-2.5 h-2.5" /> {t.files.length}
                                                    </span>
                                                )}
                                                {t.tags && t.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-3.5 px-3 whitespace-nowrap">
                                    {getStatusPill(t.status || t.rawStatus)}
                                </td>

                                <td className="py-3.5 px-3 whitespace-nowrap">
                                    {getPriorityBadge(t.priority || t.rawPriority)}
                                </td>

                                <td className="py-3.5 px-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {t.assignee?.avatar ? (
                                            <img src={t.assignee.avatar} alt={t.assignee.name} className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                                                {t.assignee?.fallback || "U"}
                                            </div>
                                        )}
                                        <span className="text-slate-300">{t.assignee?.name || "Unassigned"}</span>
                                    </div>
                                </td>

                                <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-slate-500" />
                                        <span>{t.dueDate || "No date"}</span>
                                    </div>
                                </td>

                                <td className="py-3.5 px-3 text-right">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectTask(t);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 transition"
                                        title="View Task Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filteredTasks.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                    No tasks found matching your filter criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
