import { CalendarDays, CheckSquare, FolderKanban, LayoutDashboard, MessageSquareMore, Settings, Users } from "lucide-react";

export const sidebarItem = [
    {
        title: "Dashboard",
        href: "/tasks/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Projects",
        href: "/tasks/projects",
        icon: FolderKanban,
    },
    {
        title: "My Tasks",
        href: "/tasks/my-tasks",
        icon: CheckSquare,
    },
    {
        title: "Chat",
        href: "/tasks/chat",
        icon: MessageSquareMore
    },

    {
        title: "Calendar",
        href: "/tasks/calendar",
        icon: CalendarDays,
    },
    {
        title: "Team",
        href: "/tasks/team",
        icon: Users,
    },

];