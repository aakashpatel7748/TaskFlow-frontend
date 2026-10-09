"use client";

import React from "react";
import Link from "next/link";
import { Calendar, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { UpcomingDeadline } from "@/types/dashboard";

interface UpcomingDeadlinesWidgetProps {
    deadlines: UpcomingDeadline[];
}

export const UpcomingDeadlinesWidget: React.FC<UpcomingDeadlinesWidgetProps> = ({ deadlines }) => {
    const formatDeadlineStatus = (dueDateStr: string) => {
        const dueDate = new Date(dueDateStr);
        const now = new Date();
        const diffMs = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                text: `${Math.abs(diffDays)}d overdue`,
                isOverdue: true,
                badgeBg: "rgba(231, 76, 60, 0.15)",
                badgeColor: "var(--color-error)"
            };
        } else if (diffDays === 0) {
            return {
                text: "Due today",
                isOverdue: false,
                badgeBg: "rgba(255, 165, 0, 0.15)",
                badgeColor: "var(--color-orange)"
            };
        } else if (diffDays === 1) {
            return {
                text: "Due tomorrow",
                isOverdue: false,
                badgeBg: "rgba(54, 171, 249, 0.15)",
                badgeColor: "var(--color-tertiary)"
            };
        } else {
            return {
                text: `In ${diffDays} days`,
                isOverdue: false,
                badgeBg: "rgba(158, 154, 209, 0.15)",
                badgeColor: "var(--color-secondary-dark)"
            };
        }
    };

    return (
        <div
            style={{
                backgroundColor: "var(--color-primary-light)",
                borderColor: "var(--color-stroke)"
            }}
            className="p-5 rounded-2xl border shadow-sm space-y-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3
                        style={{ color: "var(--foreground)" }}
                        className="text-sm font-bold tracking-tight"
                    >
                        Upcoming Deadlines
                    </h3>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-xs">
                        Critical dates & delivery targets
                    </p>
                </div>
                <Calendar className="w-4 h-4 text-[var(--color-tertiary)]" />
            </div>

            {deadlines.length === 0 ? (
                <div
                    style={{
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="p-6 rounded-xl border text-center space-y-1"
                >
                    <Clock className="w-6 h-6 mx-auto text-[var(--color-secondary-dark)]" />
                    <p style={{ color: "var(--foreground)" }} className="text-xs font-semibold">
                        No upcoming deadlines
                    </p>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-[11px]">
                        All current schedules are on track.
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {deadlines.map((item) => {
                        const status = formatDeadlineStatus(item.dueDate);
                        return (
                            <div
                                key={item._id}
                                style={{
                                    backgroundColor: "var(--color-primary)",
                                    borderColor: status.isOverdue
                                        ? "rgba(231, 76, 60, 0.4)"
                                        : "var(--color-stroke)"
                                }}
                                className="p-3 rounded-xl border flex items-center justify-between gap-3 hover:border-[var(--color-tertiary)] transition-colors"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        {status.isOverdue && (
                                            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-error)] shrink-0" />
                                        )}
                                        <p
                                            style={{ color: "var(--foreground)" }}
                                            className="text-xs font-semibold truncate"
                                        >
                                            {item.name}
                                        </p>
                                    </div>
                                    {item.project?.name && (
                                        <p
                                            style={{ color: "var(--color-secondary-dark)" }}
                                            className="text-[10px] font-mono truncate mt-0.5"
                                        >
                                            {item.project.name}
                                        </p>
                                    )}
                                </div>

                                <span
                                    style={{
                                        backgroundColor: status.badgeBg,
                                        color: status.badgeColor
                                    }}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono"
                                >
                                    {status.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
