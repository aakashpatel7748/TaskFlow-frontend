import { UserPlus, Users } from 'lucide-react'
import React from 'react'

const PageTitleCard = ({ title, icon, description, action }: { title: string, icon: React.ReactNode, description: string, action?: React.ReactNode }) => {
    return (
        <div style={{ backgroundColor: "var(--color-primary-light)", borderRadius: "5px" }} className="flex items-center  justify-between p-5 border-b border-slate-200 dark:border-slate-800 ">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-xl bg-violet-600/20 text-violet-600 dark:text-violet-400 border border-violet-500/30 flex items-center justify-center">
                        {icon}
                    </div>
                    <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                        {title}
                    </h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            </div>

            {action && action}
        </div>
    )
}

export default PageTitleCard