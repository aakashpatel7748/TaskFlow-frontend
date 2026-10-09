"use client";

import React from "react";

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div
                style={{
                    backgroundColor: "var(--color-primary-light)",
                    borderColor: "var(--color-stroke)"
                }}
                className="h-24 rounded-2xl border p-5 flex items-center justify-between"
            >
                <div className="space-y-2">
                    <div
                        style={{ backgroundColor: "var(--color-primary)" }}
                        className="h-6 w-48 rounded-lg"
                    />
                    <div
                        style={{ backgroundColor: "var(--color-primary)" }}
                        className="h-4 w-72 rounded-md"
                    />
                </div>
                <div
                    style={{ backgroundColor: "var(--color-primary)" }}
                    className="h-10 w-32 rounded-xl hidden md:block"
                />
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: "var(--color-primary-light)",
                            borderColor: "var(--color-stroke)"
                        }}
                        className="p-5 rounded-2xl border space-y-3"
                    >
                        <div className="flex justify-between items-center">
                            <div
                                style={{ backgroundColor: "var(--color-primary)" }}
                                className="h-3 w-20 rounded"
                            />
                            <div
                                style={{ backgroundColor: "var(--color-primary)" }}
                                className="h-8 w-8 rounded-xl"
                            />
                        </div>
                        <div
                            style={{ backgroundColor: "var(--color-primary)" }}
                            className="h-8 w-16 rounded"
                        />
                        <div
                            style={{ backgroundColor: "var(--color-primary)" }}
                            className="h-2 w-full rounded"
                        />
                    </div>
                ))}
            </div>

            {/* Main Content Split Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div
                    style={{
                        backgroundColor: "var(--color-primary-light)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="lg:col-span-2 p-5 rounded-2xl border space-y-4"
                >
                    <div className="flex justify-between items-center">
                        <div
                            style={{ backgroundColor: "var(--color-primary)" }}
                            className="h-5 w-40 rounded"
                        />
                        <div
                            style={{ backgroundColor: "var(--color-primary)" }}
                            className="h-4 w-16 rounded"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                style={{ backgroundColor: "var(--color-primary)" }}
                                className="h-32 rounded-xl"
                            />
                        ))}
                    </div>
                </div>

                <div
                    style={{
                        backgroundColor: "var(--color-primary-light)",
                        borderColor: "var(--color-stroke)"
                    }}
                    className="p-5 rounded-2xl border space-y-4"
                >
                    <div
                        style={{ backgroundColor: "var(--color-primary)" }}
                        className="h-5 w-32 rounded"
                    />
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                style={{ backgroundColor: "var(--color-primary)" }}
                                className="h-14 rounded-xl"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
