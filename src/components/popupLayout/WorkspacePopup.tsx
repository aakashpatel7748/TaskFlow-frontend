import React, { useEffect, useState } from 'react'

import PopupModel from "@/components/tasks/PopupModel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Building2, ChevronDown, PlusIcon } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import {
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller, useForm } from 'react-hook-form';
import { WorkspaceManage, WorkspacePurpose } from '../constant';
import { createWorkSpaceAPI, fetchWorkSpaceAPI } from '@/services/opreations/workspace';
import { SaveWorkspacePayload } from '@/types/workspace';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponce';
import { toast } from '../ui/toast';

type WsPopup = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setWorkspaceOpenModel: (open: boolean) => void;
}

const WorkspacePopup = () => {
    const [workspaceOpenModel, setWorkspaceOpenModel] = useState(false);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
    const [workspaces, setWorkspaces] = useState<SaveWorkspacePayload[]>([]);

    const form = useForm({
        defaultValues: {
            name: "",
            manage: "",
            purpose: "",
        },
    });

    const fetchWorkspaces = async () => {
        try {
            const response = await fetchWorkSpaceAPI().action();
            const fetchedList: SaveWorkspacePayload[] = response?.data?.data || [];
            if (fetchedList.length > 0) {
                setWorkspaces(fetchedList);

                // Restore previously selected workspace from localStorage or default to the first one
                const savedWsId = localStorage.getItem("selectedWorkspaceId");
                const exists = fetchedList.find((w) => w._id === savedWsId);

                if (exists && exists._id) {
                    setSelectedWorkspaceId(exists._id);
                    localStorage.setItem("selectedWorkspace", exists.name);
                    localStorage.setItem("selectedWorkspaceId", exists._id);
                } else {
                    const defaultWs = fetchedList[0];
                    if (defaultWs && defaultWs._id) {
                        setSelectedWorkspaceId(defaultWs._id);
                        localStorage.setItem("selectedWorkspace", defaultWs.name);
                        localStorage.setItem("selectedWorkspaceId", defaultWs._id);
                    }
                }
                window.dispatchEvent(new Event("workspaceChanged"));
            }
        } catch (error) {
            console.log("Failed to fetch workspaces:", error);
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMsg = axiosError.response?.data.message;
            toast.add({
                title: "Failed to fetch workspaces",
                description: errorMsg,
            });
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const handleSelectWorkspace = (val: string | null) => {
        if (!val) return;

        const targetWs = workspaces.find((w) => w._id === val);
        if (!targetWs || !targetWs._id) return;

        setSelectedWorkspaceId(targetWs._id);
        localStorage.setItem("selectedWorkspace", targetWs.name);
        localStorage.setItem("selectedWorkspaceId", targetWs._id);
        window.dispatchEvent(new Event("workspaceChanged"));
    };


    const onSubmit = async (data: SaveWorkspacePayload) => {
        try {
            const response = await createWorkSpaceAPI().action(data);
            setWorkspaceOpenModel(false);
            form.reset();
            await fetchWorkspaces();
            toast.add({
                title: "Workspace created successfully",
                description: response.data.message,
            });
        } catch (error) {
            console.log("Failed to create workspace:", error);
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMsg = axiosError.response?.data.message;
            toast.add({
                title: "Failed to create workspace",
                description: errorMsg,
            });
        }
    };

    const currentWorkspace = workspaces.find((w) => w._id === selectedWorkspaceId);

    return (
        <div className="relative flex items-center justify-between gap-1 w-full glass-card p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex-1 min-w-0">
                <Select value={selectedWorkspaceId} onValueChange={handleSelectWorkspace}>
                    <SelectTrigger className="w-full h-auto p-1.5 border-none bg-transparent shadow-none focus:ring-0 flex items-center justify-between text-left">
                        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                            <span className="h-6 w-6 bg-red-800 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                                {currentWorkspace?.name ? currentWorkspace.name.charAt(0) : "W"}
                            </span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {currentWorkspace?.name || "Select Workspace"}
                            </span>
                        </div>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectGroup>
                            {workspaces.length === 0 ? (
                                <div className="p-2 text-xs text-slate-500 text-center">No workspaces found</div>
                            ) : (
                                workspaces.map((workspace, index) => (
                                    <SelectItem
                                        key={workspace._id || index}
                                        value={workspace._id || ""}
                                    >
                                        {workspace.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <button
                type="button"
                onClick={() => setWorkspaceOpenModel(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0"
                title="Create Workspace"
            >
                <PlusIcon className="w-3 h-3" />
            </button>

            <PopupModel
                open={workspaceOpenModel}
                onOpenChange={setWorkspaceOpenModel}
                title="Create New Workspace"
                description="Configure a new workspace for your spaces, projects, and team members."
                icon={<Building2 className="w-5 h-5 text-indigo-500" />}
                maxWidth="max-w-2xl"
                onSubmit={(e) => {
                    e.preventDefault();
                    setWorkspaceOpenModel(false);
                }}
                defaultStatus="DONE"
                workspaceId=""
                projectId=""
                onCreateTask={() => { }}
            >
                <div className="space-y-4">

                    <CardContent className='space-y-4 text-xs'>
                        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Controller
                                        name="manage"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="input-group">
                                                <label className="input-label" htmlFor="workspace-manage">
                                                    What to Manage <span className="required">*</span>
                                                </label>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="select" id="workspace-manage">
                                                        <SelectValue placeholder="Select what to manage" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {WorkspaceManage.map((item) => (
                                                                <SelectItem key={item.label} value={item.value}>
                                                                    {item.value}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="purpose"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="input-group">
                                                <label className="input-label" htmlFor="workspace-purpose">
                                                    Work & Projects <span className="required">*</span>
                                                </label>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="select" id="workspace-purpose">
                                                        <SelectValue placeholder="Select purpose" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {WorkspacePurpose.map((item) => (
                                                                <SelectItem key={item.label} value={item.value}>
                                                                    {item.value}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Controller
                                        name="name"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className='input-label' htmlFor="form-rhf-demo-title">
                                                    Workspace Name <span className="text-rose-500">*</span>
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className='input'
                                                    id="form-rhf-demo-title"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder=" Enter workspace name"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />

                                </div>




                            </FieldGroup>
                        </form>
                    </CardContent>

                    <CardFooter>
                        <Field orientation="horizontal" className='flex aligns-center justify-between bg-pri mt-3'>
                            <Button type="button" variant="outline" onClick={() => form.reset()}>
                                Reset
                            </Button>
                            <Button type="submit" form="form-rhf-demo">
                                Submit
                            </Button>
                        </Field>
                    </CardFooter>

                </div>

            </PopupModel>

        </div>

    )
}

export default WorkspacePopup