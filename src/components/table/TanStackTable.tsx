import React, { useState } from 'react'
import {
    tableFeatures,
    useTable,
    rowSortingFeature, createSortedRowModel, sortFns
} from '@tanstack/react-table'
import type { ColumnDef, RowData, } from '@tanstack/react-table'

export const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns })

export interface TanStackTableProps<T extends RowData> {
    columns: Array<ColumnDef<typeof features, T>>
    data: T[]
    emptyMessage?: string
    onRowClick?: (row: T) => void
}

export function TanStackTable<T extends RowData>({
    columns,
    data,
    emptyMessage = "No matching records found",
    onRowClick,
}: TanStackTableProps<T>) {

    // Create the table instance with sorting and filtering enabled
    const table = useTable({
        key: 'tanstack-table',
        features,
        columns,
        data,
    })

    const rows = table.getRowModel().rows

    return (
        <div className="space-y-3">
            {/* Table Wrapper */}
            <div className="rounded-2xl bg-[var(--card)] dark:bg-[#353456] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                        <thead className="bg-[var(--color-secondary-light)] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`py-3.5 px-4 font-semibold`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {header.isPlaceholder ? null : (
                                                    <table.FlexRender header={header} />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                            {rows.length > 0 ? (
                                rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        onClick={() => onRowClick?.(row.original)}
                                        className={`py-3.5 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${onRowClick ? "cursor-pointer" : ""}`}
                                    >
                                        {row.getAllCells().map((cell) => (
                                            <td key={cell.id} className="py-3.5 px-4">
                                                <table.FlexRender cell={cell} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length || 1} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                        <p className="text-xs font-semibold">{emptyMessage}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TanStackTable;
