"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    MessageSquareMore,
    CalendarDays,
    Users,
    Settings,
    ChevronDown,
    Plus,
    Sparkles,
    Building2,
    Hash,
    ChevronRight,
    UserPlus,
    Layers,
    PlusIcon,
} from "lucide-react";
import { useState } from "react";

import WorkspacePopup from "@/components/popupLayout/WorkspacePopup";
import { SpacePopup } from "@/components/popupLayout/SpacePopup";
import { TaskFlowLogo } from "@/app/authentication/sign-in/page";


interface SpaceItem {
    id: string;
    name: string;
    iconColor: string;
    projects: { id: string; name: string; badge?: string }[];
}



export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();



    const mainNav = [
        { title: "Dashboard", href: "/tasks/dashboard", icon: LayoutDashboard },
        { title: "Spaces", href: "/tasks/spaces", icon: Layers },
        { title: "Projects & Tasks", href: "/tasks/projects", icon: FolderKanban },
        { title: "My Tasks", href: "/tasks/my-tasks", icon: CheckSquare, count: 4 },
        { title: "Chat & Discussions", href: "/tasks/chat", icon: MessageSquareMore },
        { title: "Calendar", href: "/tasks/calendar", icon: CalendarDays },
        { title: "Team Members", href: "/tasks/team", icon: Users }
    ];



    return (
        <aside className="w-68 h-screen bg-[var(--color-primary-light)] border-r border-slate-200 dark:border-slate-700/60 flex flex-col justify-between shrink-0 select-none text-[var(--sidebar-foreground)]">
            {/* Top Workspace & Logo */}
            <div className="relative z-30">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <TaskFlowLogo size="sm" />
                            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                                TaskFlow
                            </span>
                        </div>
                        <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                            PRO
                        </span>
                    </div>

                    {/* Workspace Selector Dropdown */}
                    <div className="relative z-30">
                        <WorkspacePopup />
                    </div>

                </div>

                <div className=" max-h-[400px] overflow-y-auto">
                    {/* Main Navigation */}
                    <nav className="p-3 space-y-1 ">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Menu
                        </div>
                        {mainNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                                        ? "bg-[#36abf9] text-white shadow-md shadow-sky-500/25 dark:bg-[#36abf9] dark:text-white"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`w-3 h-3 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`} />
                                        <span style={{ fontSize: "15px" }}>{item.title}</span>
                                    </div>
                                    {item.count && (
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isActive ? "bg-white/20 text-white" : "bg-sky-500/20 text-sky-700 dark:text-sky-300"}`}>
                                            {item.count}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Spaces & Projects Accordion Tree */}
                    <div className="relative">
                        <SpacePopup />
                    </div>
                </div>

                {/* Bottom Actions & User Profile */}
                <div className="p-3 border-t border-slate-800/80 space-y-2">
                    <button
                        onClick={() => router.push("/tasks/team")}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 hover:from-violet-600/30 hover:to-indigo-600/30 border border-violet-500/30 text-xs font-semibold text-violet-300 transition-all shadow-sm group"
                    >
                        <UserPlus className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                        <span>Invite Members</span>
                    </button>

                    <button
                        onClick={() => router.push("/tasks/setting")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
                    >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Workspace Settings</span>
                    </button>
                </div>

            </div>
        </aside>
    );
}
