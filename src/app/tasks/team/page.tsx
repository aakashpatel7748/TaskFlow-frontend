"use client";

import InviteMemberModal from "@/components/team/InviteMemberModal";
import {
    Users,
    UserPlus,
    MoreHorizontal,
    CheckCircle2,
    Clock,
} from "lucide-react";
import PageTitleCard from "@/components/card/PageTitleCard";
import TanStackTable from "@/components/table/TanStackTable";
import { ColumnDef, } from "@tanstack/react-table";
import { features } from "@/components/table/TanStackTable";
import { useEffect, useState } from "react";
import { getEmailInvitationList } from "@/services/opreations/emailInvitation";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponce";
import { toast } from "@/components/ui/toast";

type members = {
    email: string
    role: string
    status: string
    tasksAssigned?: number
}


export default function TeamPage() {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [emailList, setEmailList] = useState<members[]>([])

    const members = [
        { name: "Rahul Sharma", email: "rahul@taskflow.dev", role: "Workspace Owner", status: "Active", tasksAssigned: 4, avatar: "RS" },
        { name: "Priya Patel", email: "priya@taskflow.dev", role: "Project Admin", status: "Active", tasksAssigned: 3, avatar: "PP" },
        { name: "Aarav Mehta", email: "aarav@taskflow.dev", role: "Frontend Lead", status: "Active", tasksAssigned: 5, avatar: "AM" },
        { name: "Siddharth Verma", email: "siddharth@company.com", role: "Member", status: "Pending Invite", tasksAssigned: 0, avatar: "SV" }
    ];

    useEffect(() => {
        const getInvitationList = async () => {
            try {
                const responce = await getEmailInvitationList().action()
                if (responce?.data?.success) {
                    setEmailList(responce.data.data)
                } else {
                    setEmailList([])
                }
            } catch (error) {
                console.error("Error in Email List", error);
                const axiosError = error as AxiosError<ApiResponse>;
                const errorMsg = axiosError.response?.data.message;
                toast.add({
                    title: " Email list error ",
                    description: errorMsg,
                });
            }

        }
        getInvitationList()
    }, [])





    // 4. Define your columns
    const columns: Array<ColumnDef<typeof features, members>> = [
        {
            accessorKey: 'email', // accessorKey shorthand
            header: ({ column }) => {
                return (
                    <button
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="flex items-center gap-2"
                    >
                        Member
                        <span>↕</span>
                    </button>
                )
            },
            cell: (info) => {
                const { email } = info.row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                            {email.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{email}</p>
                        </div>
                    </div>
                )
            },
        },

        {
            accessorKey: 'role',
            header: () => 'Role',
            cell: (info) => {
                const { role } = info.row.original;
                return (
                    <span className="px-2.5 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-300 font-semibold border border-violet-500/20 text-[11px]">
                        {role}
                    </span>
                )
            }
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const { status } = info.row.original;
                return (
                    <>
                        {
                            status === "Active" ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                    <Clock className="w-3.5 h-3.5" /> Pending Invite
                                </span>
                            )
                        }
                    </>

                )
            }
        },
        // {
        //     accessorKey: 'tasksAssigned',
        //     header: () => 'Tasks Assigned',
        // },

    ]


    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto select-none">
            {/* Header */}
            <PageTitleCard
                title="Team Members"
                description="Manage workspace roles, pending invites, and member permissions in Acme Corp ⚡"
                icon={<Users />}
                action={
                    <button
                        onClick={() => setIsInviteOpen(true)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-all"
                    >
                        <UserPlus className="w-2 h-2 rounded-xl" />
                        <span>Invite Member</span>
                    </button>
                }
            />

            {/* email invitation popup */}
            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />


            {/* Team Table */}
            <TanStackTable columns={columns} data={emailList} />
        </div>
    );
}