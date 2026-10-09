"use client";

import React, { useState } from "react";
import { TaskItem } from "./Board";
import {
    X,
    Flame,
    AlertCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    CheckSquare,
    MessageSquare,
    Send,
    User,
    Calendar,
    Layers,
    Share2,
    Paperclip,
    ExternalLink,
    CheckCircle2,
    Clock
} from "lucide-react";

interface TaskDetailDrawerProps {
    task: TaskItem | null;
    projectName?: string;
    onClose: () => void;
}

export default function TaskDetailDrawer({ task, projectName, onClose }: TaskDetailDrawerProps) {
    if (!task) return null;

    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([
        { id: "c1", user: "Team Lead", text: "Task created in project workspace.", time: "Recent" }
    ]);

    const [subtasksList, setSubtasksList] = useState([
        { id: "s1", text: "Review task requirements", completed: task.status === "completed" || task.status === "DONE" },
        { id: "s2", text: "Implement and push changes", completed: task.status === "completed" || task.status === "DONE" }
    ]);

    const toggleSubtask = (id: string) => {
        setSubtasksList(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setComments(prev => [
            ...prev,
            { id: Date.now().toString(), user: "You", text: commentText.trim(), time: "Just now" }
        ]);
        setCommentText("");
    };

    const getPriorityBadge = (priority?: string) => {
        const p = (priority || "").toLowerCase();
        switch (p) {
            case "urgent":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 font-bold border border-rose-500/25 text-xs"><Flame className="w-3 h-3 text-rose-400" /> Urgent</span>;
            case "high":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25 text-xs"><AlertCircle className="w-3 h-3 text-amber-400" /> High</span>;
            case "medium":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/25 text-xs"><ArrowUpCircle className="w-3 h-3 text-indigo-400" /> Medium</span>;
            case "low":
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700 text-xs"><ArrowDownCircle className="w-3 h-3 text-slate-400" /> Low</span>;
        }
    };

    const getStatusBadge = (status?: string) => {
        const s = (status || "").toLowerCase().replace("_", "-");
        switch (s) {
            case "to-do":
            case "todo":
                return <span className="inline-block px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 font-bold border border-rose-500/25 text-xs">To Do</span>;
            case "in-progress":
            case "inprogress":
                return <span className="inline-block px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-300 font-bold border border-blue-500/25 text-xs">In Progress</span>;
            case "completed":
            case "done":
                return <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/25 text-xs">Completed</span>;
            default:
                return <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-bold border border-slate-700 text-xs">{status || "Pending"}</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-[#1e1e2d] border-l border-slate-700/60 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-violet-400 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                            {task.key}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            {projectName ? `In ${projectName}` : "Task Details"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Drawer Body Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Task Title */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 leading-snug">
                            {task.title}
                        </h2>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-xs">
                        <div className="space-y-1">
                            <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" /> Status
                            </span>
                            <div>{getStatusBadge(task.status || task.rawStatus)}</div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-rose-400" /> Priority
                            </span>
                            <div>{getPriorityBadge(task.priority || task.rawPriority)}</div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Assignee
                            </span>
                            <div className="flex items-center gap-2 pt-0.5">
                                {task.assignee?.avatar ? (
                                    <img src={task.assignee.avatar} alt={task.assignee.name} className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-[10px]">
                                        {task.assignee?.fallback || "U"}
                                    </div>
                                )}
                                <span className="font-semibold text-slate-200 truncate">{task.assignee?.name || "Unassigned"}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Due Date
                            </span>
                            <span className="font-mono text-slate-300 font-semibold">{task.dueDate || "No due date"}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/60">
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    {/* Attachments / Files if present */}
                    {task.files && task.files.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Paperclip className="w-3.5 h-3.5 text-violet-400" /> Attached Files ({task.files.length})
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                {task.files.map((file, idx) => (
                                    <a
                                        key={idx}
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-violet-500/50 transition group"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Paperclip className="w-4 h-4 text-violet-400 shrink-0" />
                                            <span className="text-xs font-medium text-slate-200 truncate group-hover:text-violet-300 transition">
                                                {file.filename || "Attachment " + (idx + 1)}
                                            </span>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400 shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subtasks Checklist */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-violet-400" /> Subtasks
                            </h4>
                            <span className="text-xs font-mono text-slate-500">
                                {subtasksList.filter(s => s.completed).length}/{subtasksList.length} Completed
                            </span>
                        </div>

                        <div className="space-y-2">
                            {subtasksList.map(st => (
                                <div
                                    key={st.id}
                                    onClick={() => toggleSubtask(st.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${st.completed
                                        ? "bg-slate-950/40 border-slate-800/60 text-slate-500 line-through"
                                        : "bg-slate-900 border-slate-800 text-slate-200 hover:border-violet-500/40"
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${st.completed ? "bg-violet-600 border-violet-600 text-white" : "border-slate-700"
                                        }`}>
                                        {st.completed && <CheckCircle2 className="w-3 h-3" />}
                                    </div>
                                    <span className="text-xs font-medium">{st.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comments Thread */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> Activity & Comments ({comments.length})
                        </h4>

                        <div className="space-y-3">
                            {comments.map(c => (
                                <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-violet-300">{c.user}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">{c.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-300">{c.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Add Comment Input */}
                        <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                            />
                            <button
                                type="submit"
                                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
