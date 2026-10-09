export interface TaskMetrics {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
    completionRate: number;
}

export interface ProjectMetrics {
    total: number;
    completed: number;
    inProgress: number;
    planning: number;
    completionRate: number;
}

export interface PriorityBreakdown {
    urgent: number;
    high: number;
    medium: number;
    low: number;
}

export interface StatusBreakdown {
    "to-do": number;
    "in-progress": number;
    completed: number;
}

export interface DashboardProject {
    _id: string;
    name: string;
    description?: string;
    isPrivate?: boolean;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    progress: number;
    status: "Completed" | "In Progress" | "Planning";
    space?: {
        _id?: string;
        name?: string;
        color?: string;
    };
}

export interface DashboardTask {
    _id: string;
    name: string;
    status: "to-do" | "in-progress" | "completed";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    assigneeEmail?: string;
    createdAt?: string;
    assignee?: {
        _id?: string;
        fullName?: string;
        username?: string;
        email?: string;
        avatar?: string;
    };
    project?: {
        _id?: string;
        name?: string;
    };
}

export interface UpcomingDeadline {
    _id: string;
    name: string;
    status: string;
    priority: string;
    dueDate: string;
    project?: {
        _id?: string;
        name?: string;
    };
    assignee?: {
        _id?: string;
        fullName?: string;
        username?: string;
        avatar?: string;
    };
}

export interface MyTasksSummary {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
}

export interface DashboardData {
    taskMetrics: TaskMetrics;
    projectMetrics: ProjectMetrics;
    priorityBreakdown: PriorityBreakdown;
    statusBreakdown: StatusBreakdown;
    projects: DashboardProject[];
    recentTasks: DashboardTask[];
    upcomingDeadlines: UpcomingDeadline[];
    myTasksSummary: MyTasksSummary;
}
