"use client";

import React from "react";
import { Flame, AlertCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { PriorityBreakdown } from "@/types/dashboard";

interface PriorityDistributionWidgetProps {
    priorityBreakdown: PriorityBreakdown;
    total: number;
}

export const PriorityDistributionWidget: React.FC<PriorityDistributionWidgetProps> = ({
    priorityBreakdown,
    total
}) => {
    const items = [
        {
            key: "urgent",
            label: "Urgent",
            count: priorityBreakdown.urgent || 0,
            color: "var(--color-error)",
            bgColor: "rgba(231, 76, 60, 0.15)",
            icon: Flame
        },
        {
            key: "high",
            label: "High",
            count: priorityBreakdown.high || 0,
            color: "var(--color-orange)",
            bgColor: "rgba(255, 165, 0, 0.15)",
            icon: AlertCircle
        },
        {
            key: "medium",
            label: "Medium",
            count: priorityBreakdown.medium || 0,
            color: "var(--color-tertiary)",
            bgColor: "rgba(54, 171, 249, 0.15)",
            icon: ArrowUpCircle
        },
        {
            key: "low",
            label: "Low",
            count: priorityBreakdown.low || 0,
            color: "var(--color-secondary-dark)",
            bgColor: "rgba(158, 154, 209, 0.15)",
            icon: ArrowDownCircle
        }
    ];

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
                        Priority Breakdown
                    </h3>
                    <p style={{ color: "var(--color-secondary-dark)" }} className="text-xs">
                        Task workload intensity
                    </p>
                </div>
                {(priorityBreakdown.urgent || 0) > 0 && (
                    <span
                        style={{
                            backgroundColor: "rgba(231, 76, 60, 0.15)",
                            color: "var(--color-error)"
                        }}
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                    >
                        {priorityBreakdown.urgent} Urgent
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {items.map((item) => {
                    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    const IconComponent = item.icon;

                    return (
                        <div key={item.key} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        style={{ color: item.color }}
                                        className="flex items-center"
                                    >
                                        <IconComponent className="w-3.5 h-3.5" />
                                    </span>
                                    <span style={{ color: "var(--foreground)" }} className="font-medium">
                                        {item.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span style={{ color: "var(--color-secondary-dark)" }} className="text-[11px] font-mono">
                                        {pct}%
                                    </span>
                                    <span
                                        style={{ color: "var(--foreground)" }}
                                        className="font-bold font-mono text-xs w-5 text-right"
                                    >
                                        {item.count}
                                    </span>
                                </div>
                            </div>

                            <div
                                style={{ backgroundColor: "var(--color-primary)" }}
                                className="w-full h-1.5 rounded-full overflow-hidden"
                            >
                                <div
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor: item.color
                                    }}
                                    className="h-full rounded-full transition-all duration-500"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
