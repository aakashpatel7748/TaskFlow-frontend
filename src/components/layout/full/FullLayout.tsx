"use client";

import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";
import { useState } from "react";

export default function FullLayout({ children }: { children: React.ReactNode }) {
    const [createTaskOpen, setCreateTaskOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header onOpenCreateTask={() => setCreateTaskOpen(true)} />

                <main className=" p-5 flex-1 overflow-auto bg-[var(--color-primary)] relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

