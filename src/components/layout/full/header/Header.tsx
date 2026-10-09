"use client";

import { Bell, Search, Plus, Sparkles, ChevronRight, CheckCircle2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserMenu from "./UserMenu";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
    onOpenCreateTask?: () => void;
}

const Header = ({ onOpenCreateTask }: HeaderProps) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsCount = 3;
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-700/60 bg-[var(--sidebar)] flex items-center justify-between px-6 shrink-0 z-30 select-none text-[var(--sidebar-foreground)]">
            {/* Left: Dynamic Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition">
                    Acme Corp
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-600 text-slate-400" />
                <span className="flex items-center gap-1 font-medium text-slate-400 dark:text-slate-400 text-slate-600 hover:text-slate-200 cursor-pointer transition">
                    <span className="text-indigo-400">●</span> Engineering
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-600 text-slate-400" />
                <span className="font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                    Mobile App v2
                </span>
            </div>

            {/* Middle: Quick Search Input */}
            <div className="hidden md:flex items-center relative w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                    id="header-search-input"
                    placeholder="Search tasks, docs, members..."
                    className="pl-9 pr-12 h-9 text-xs  border-slate-800 dark:border-slate-800 border-slate-300 text-slate-200 dark:text-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-violet-500/50 rounded-xl"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-slate-800/80 dark:bg-slate-800/80 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-700 dark:border-slate-700 border-slate-300">
                    ⌘K
                </kbd>
            </div>

            {/* Right: Primary Action, Theme Toggle, Notifications & User Avatar */}
            <div className="flex items-center gap-3">

                {/* Theme Switcher Toggle Button */}
                <button
                    onClick={toggleTheme}
                    title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    className=" rounded-xl   text-amber-400 dark:text-amber-400 text-slate-700  "
                >
                    {theme === "dark" ? (
                        <Sun className="h-3 w-3 text-amber-400" />
                    ) : (
                        <Moon className="h-3 w-3 text-indigo-600" />
                    )}
                </button>

                {/* Notifications Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="relative p-2 rounded-xl text-slate-400  "
                    >
                        <Bell className="h-3 w-3" />
                        {notificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center border ">
                                {notificationsCount}
                            </span>
                        )}
                    </button>

                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="text-xs font-bold text-slate-200">Notifications</span>
                                <span className="text-[10px] text-violet-400 cursor-pointer hover:underline">Mark all read</span>
                            </div>
                            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                                <div className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition text-slate-300 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-violet-300">Rahul Sharma</span>
                                        <span className="text-[10px] text-slate-500">2m ago</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">Assigned task <span className="text-slate-200 font-mono">#AUTH-92</span> to you.</p>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition text-slate-300 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-emerald-300">Priya Patel</span>
                                        <span className="text-[10px] text-slate-500">1h ago</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">Commented on <span className="text-slate-200 font-mono font-medium">UI Redesign</span>.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative p-1">
                    <UserMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;
