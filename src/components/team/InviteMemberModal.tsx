"use client";

import React, { useEffect, useState } from "react";
import { X, UserPlus, Copy, Check, Mail, ShieldCheck, Sparkles, Building2, User, Users } from "lucide-react";
import PopupModel from "../tasks/PopupModel";
import { CardContent, CardFooter } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { Controller, useForm } from "react-hook-form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { fetchWorkSpaceAPI } from "@/services/opreations/workspace";
import { SaveWorkspacePayload } from "@/types/workspace";
import { emailInvitationAPI } from "@/services/opreations/emailInvitation";
import { WorkspaceRole } from "../constant";
import { toast } from "../ui/toast";

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
    if (!isOpen) return null;

    const [email, setEmail] = useState("");
    // const [role, setRole] = useState("MEMBER");
    const [copied, setCopied] = useState(false);
    const [invited, setInvited] = useState(false);
    const [workspace, setWorkspace] = useState<SaveWorkspacePayload[]>([])

    const shareableLink = "https://taskflow.app/invite/ws_98a72b1c4e";

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // worksapceId
    const workspaceId = localStorage.getItem("selectedWorkspaceId")

    if (typeof workspaceId !== "string") {
        throw new Error("Workspace ID is not a string")
    }
    const form = useForm({
        defaultValues: {
            email: "",
            role: ""
        },
    })
    const onSubmit = async (data: any) => {
        try {
            const response = await emailInvitationAPI().action({
                email: data.email,
                workspaceId,
                role: data.role || "member"
            });
            if (response?.data?.success === true || response?.status === 200 || response?.status === 201) {
                toast.add({
                    title: "Invited",
                    description: "Invitation sent successfully!",
                    type: "success",
                });
                form.reset();
                onClose();
            }
        } catch (error: any) {
            console.log("Invitation Error", error);
            toast.add({
                title: "Invitation Failed",
                description: error?.response?.data?.message || "Something went wrong while sending invite",
                type: "error",
            });
        }
    };


    return (
        <div className=" bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <PopupModel
                open={isOpen}
                onOpenChange={onClose}
                title="Create New Workspace"
                description="Configure a new workspace for your spaces, projects, and team members."
                icon={<Building2 className="w-5 h-5 text-indigo-500" />}
                maxWidth="max-w-2xl"
                onSubmit={(e) => {
                    e.preventDefault();
                    onClose();
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
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className='input-label' htmlFor="form-rhf-demo-title">
                                                Invitation Email <span className="text-rose-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                className='input'
                                                id="form-rhf-demo-title"
                                                aria-invalid={fieldState.invalid}
                                                placeholder=" Enter Email"
                                                autoComplete="off"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="role"
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="input-group">
                                            <label className="input-label" htmlFor="workspace-role">
                                                Role <span className="required">*</span>
                                            </label>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="select" id="workspace-role">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-80 min-w-[320px]">
                                                    <SelectGroup>
                                                        {WorkspaceRole.map((item) => (
                                                            <SelectItem key={item.value} value={item.value} className="py-2.5 items-start">
                                                                <div className="flex flex-col text-left gap-0.5">
                                                                    <div className="flex items-center gap-2 font-medium text-sm">
                                                                        {item.value === "admin" && <ShieldCheck className="size-4 text-purple-400" />}
                                                                        {item.value === "member" && <User className="size-4 text-blue-400" />}
                                                                        {item.value === "guest" && <Users className="size-4 text-amber-400" />}
                                                                        <span>{item.label}</span>
                                                                    </div>
                                                                    <span className="text-xs text-[var(--color-secondary-dark)] whitespace-normal font-normal leading-tight mt-0.5">
                                                                        {item.description}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
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
    );
}
