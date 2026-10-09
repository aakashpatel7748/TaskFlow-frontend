import React, { useEffect, useState, useRef } from 'react'
import PopupModel from '../tasks/PopupModel'
import { ChevronDown, ChevronRight, Hash, Layers, Plus, Sparkles, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';


import { Textarea } from "@/components/ui/textarea"

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
import { Controller, useForm } from 'react-hook-form';
import { spacePayloadInterFace } from '@/types/space';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { createSpaceAPI, getSpaceAPI } from '@/services/opreations/space';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponce';
import { toast } from '../ui/toast';
import Project from './Project';
import ProjectList from './ProjectList';

type SpacePopupProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setSpaceOpenModel: (open: boolean) => void;
}

const mockSpaces = [
    {
        id: "space-1",
        name: "Engineering",
        iconColor: "text-indigo-400",
        projects: [
            { id: "p-1", name: "Mobile App v2", badge: "Live" },
            { id: "p-2", name: "Backend Refactor" },
            { id: "p-3", name: "DevOps & CI/CD" }
        ]
    },
    {
        id: "space-2",
        name: "Product Design",
        iconColor: "text-violet-400",
        projects: [
            { id: "p-4", name: "UI Redesign 2026", badge: "Urgent" },
            { id: "p-5", name: "Design System Tokens" }
        ]
    },
    {
        id: "space-3",
        name: "Marketing & Sales",
        iconColor: "text-emerald-400",
        projects: [
            { id: "p-6", name: "Q3 Growth Campaign" }
        ]
    }
];

export const SpacePopup = () => {
    const router = useRouter();
    const [spaceOpenModel, setSpaceOpenModel] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [spaceData, setSpaceData] = useState<any[]>([]);
    const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({});
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    const toggleMenu = () => {
        if (!menuOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuHeight = 160;
            const top = rect.top + menuHeight > window.innerHeight
                ? window.innerHeight - menuHeight - 16
                : Math.max(16, rect.top - 6);
            setMenuPos({ top, left: rect.right + 10 });
        }
        setMenuOpen((prev) => !prev);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const toggleSpace = (spaceId: string) => {
        setExpandedSpaces((prev) => ({
            ...prev,
            [spaceId]: !prev[spaceId],
        }));
    };


    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            color: "",
            icon: "",
        },
    });

    const getSpace = async (targetWsId?: string) => {
        const wsId = targetWsId || localStorage.getItem("selectedWorkspaceId");
        if (!wsId) return;
        try {
            const spaceData = await getSpaceAPI().action(wsId);
            const spaces = spaceData?.data?.data || [];
            setSpaceData(spaces);
            console.log("🚀 ~ getSpace ~ spaces:", spaces)
        } catch (error) {
            console.error("Error fetching spaces:", error);
        }
    };

    useEffect(() => {
        getSpace();

        const handleWorkspaceChange = () => {
            getSpace();
        };

        window.addEventListener("workspaceChanged", handleWorkspaceChange);
        return () => {
            window.removeEventListener("workspaceChanged", handleWorkspaceChange);
        };
    }, []);

    const onSubmit = async (data: spacePayloadInterFace) => {
        const wsId = localStorage.getItem("selectedWorkspaceId");
        if (!wsId) {
            toast.add({
                title: "Error",
                description: "Please select a workspace first",
            });
            return;
        }
        try {
            const dataToSend = {
                ...data,
                workSpaceId: wsId
            }
            const responce = await createSpaceAPI().action(dataToSend)
            toast.add({
                title: "Space created successfully",
                description: responce?.data?.message,
            });
            getSpace(wsId);
            setSpaceOpenModel(false);
            form.reset();
        } catch (error) {
            console.error("Error in creating space", error);
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMsg = axiosError.response?.data.message;
            toast.add({
                title: "Space creation failed",
                description: errorMsg,
            });
            setSpaceOpenModel(false);
        }
    };


    return (
        <>
            <div className="px-3 pt-2 space-y-1">
                <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-slate-500" />
                        Spaces & Projects
                    </span>
                    <div className="flex items-center gap-1">
                        {/* Plus button to create space */}
                        <button
                            type="button"
                            onClick={() => setSpaceOpenModel(true)}
                            title="Add New Space"
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                        </button>

                        {/* Details / Options (...) Menu */}
                        <div className="relative">
                            <button
                                ref={buttonRef}
                                type="button"
                                onClick={toggleMenu}
                                title="Space Options"
                                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                            >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu (Positioned to the RIGHT side with fixed z-[99999]) */}
                            {menuOpen && (
                                <div
                                    ref={menuRef}
                                    style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
                                    className="fixed w-48 rounded-xl bg-[var(--color-primary-light)] border border-[var(--color-stroke)] dark:border-[#4a4978]/90 text-[var(--foreground)] shadow-2xl p-1.5 z-[99999] text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                                >
                                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                                        Space Options
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setSpaceOpenModel(true);
                                        }}
                                        className="relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-2 px-2.5 text-xs text-slate-200 outline-none select-none hover:bg-[var(--color-primary-dark)] dark:hover:bg-slate-800/80 hover:text-white transition-colors text-left"
                                    >
                                        <div className="w-5 h-5 rounded-md bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0">
                                            <Plus className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-medium">Create Space</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            router.push("/tasks/spaces");
                                        }}
                                        className="relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-2 px-2.5 text-xs text-slate-200 outline-none select-none hover:bg-[var(--color-primary-dark)] dark:hover:bg-slate-800/80 hover:text-white transition-colors text-left"
                                    >
                                        <div className="w-5 h-5 rounded-md bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                                            <Layers className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-medium">Show All Spaces</span>
                                    </button>

                                    <div className="h-[1px] bg-slate-700/40 my-0.5" />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            getSpace();
                                            toast.add({
                                                title: "Spaces Refreshed",
                                                description: "Updated spaces list",
                                            });
                                        }}
                                        className="relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-2 px-2.5 text-xs text-slate-200 outline-none select-none hover:bg-[var(--color-primary-dark)] dark:hover:bg-slate-800/80 hover:text-white transition-colors text-left"
                                    >
                                        <div className="w-5 h-5 rounded-md bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-medium">Refresh Spaces</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                    {spaceData?.map((space) => {
                        const isExpanded = !!expandedSpaces[space._id];

                        return (
                            <div key={space._id} className="space-y-0.5">
                                <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800/50 transition group">
                                    <button
                                        type="button"
                                        onClick={() => toggleSpace(space._id)}
                                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        ) : (
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        )}
                                        <span className={space.iconColor || "text-indigo-400"}>●</span>
                                        <span className="truncate">{space.name}</span>
                                    </button>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Project spaceId={space._id} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <ProjectList spaceId={space._id} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <PopupModel
                open={spaceOpenModel}
                onOpenChange={() => setSpaceOpenModel(false)}
                title="Add New Space"
                description="Configure a new space for your projects, tasks, and team members."
                icon={<Sparkles className="w-5 h-5 text-indigo-500" />}
                maxWidth="max-w-md"
            >
                <div className="space-y-4">

                    <CardContent className='space-y-4 text-xs'>
                        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>

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
                                                    placeholder=" Enter space name"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name="icon"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className='input-label' htmlFor="form-rhf-demo-title">
                                                    Space Icon
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    className='input'
                                                    id="form-rhf-demo-title"
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="  Space Icon"
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>
                                <Controller
                                    name='description'
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className='input-label mt-3' htmlFor="form-rhf-demo-title">
                                                Space Discription
                                            </FieldLabel>
                                            <Textarea {...field} style={{ width: "95%", }} className='input text-base font-thin  ' placeholder="Type your message here." />
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
        </>
    )
}

