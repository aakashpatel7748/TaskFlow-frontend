"use client";

import React, { useState } from "react";
import {
    CalendarDays,
    Sparkles,
    UserRound,
    Building2,
    FolderPlus,
    Layers,
    X,
    Loader2,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "UNDER_REVIEW" | "DONE";
export type TaskPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export interface CreateTaskData {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: string;
    dueDate: string;
    workspaceId?: string;
    projectId?: string;
}

export interface PopupModelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    // Universal Reusable Modal Props
    title?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    maxWidth?: string; // e.g. "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl"

    // Action button customization
    onSubmit?: (e: React.FormEvent) => void | Promise<void>;

    // Task-specific props (used when default task form is rendered)
    defaultStatus?: TaskStatus;
    workspaceId?: string;
    projectId?: string;
    onCreateTask?: (taskData: CreateTaskData) => void | Promise<void>;
}

export default function PopupModel({
    open,
    onOpenChange,
    title,
    description,
    icon,
    children,
    maxWidth = "max-w-2xl",
    onSubmit,
    defaultStatus = "TODO",
    workspaceId,
    projectId,
    onCreateTask,
}: PopupModelProps) {
    // Local Task Form State (when children is not provided)
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [status, setStatus] = useState<TaskStatus>(defaultStatus);
    const [priority, setPriority] = useState<TaskPriority>("HIGH");
    const [assignee, setAssignee] = useState("Rahul Sharma");
    const [dueDate, setDueDate] = useState("");

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            await onSubmit(e);
            onOpenChange(false);
            return;
        }

        if (!taskTitle.trim()) return;

        const taskData: CreateTaskData = {
            title: taskTitle.trim(),
            description: taskDescription.trim(),
            status,
            priority,
            assignee,
            dueDate,
            workspaceId,
            projectId,
        };

        await onCreateTask?.(taskData);
        resetTaskForm();
        onOpenChange(false);
    };

    const resetTaskForm = () => {
        setTaskTitle("");
        setTaskDescription("");
        setStatus(defaultStatus);
        setPriority("HIGH");
        setAssignee("Rahul Sharma");
        setDueDate("");
    };

    const handleClose = () => {
        resetTaskForm();
        onOpenChange(false);
    };

    // Header Content Resolution
    const displayTitle = title || "Create New Task";
    const displayDescription =
        description || "Add a task and assign it to your team workspace.";
    const displayIcon = icon || <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`w-full  ${maxWidth} rounded-2xl border border-slate-200 dark:border-slate-700/60  dark:bg-[#353456] p-0 shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden outline-none backdrop-blur-none`}
            >
                {/* Modal Header */}
                <DialogHeader className="border-b border-slate-200 dark:border-slate-700/60 px-6 py-5 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm">
                            {displayIcon}
                        </div>

                        <div className="space-y-0.5">
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {displayTitle}
                            </DialogTitle>

                            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                                {displayDescription}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body: Custom Children OR Default Task Form */}
                <div className="p-6 space-y-5">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
