import { taskEndPoints } from "../apiEndpoints";
import { apiConnector } from "../APIConector";

const { CREATE_TASK_ROUTE, GET_TASKS_ROUTE } = taskEndPoints;

export function createTaskAPI() {
    return {
        action: (values: FormData | Record<string, any>) => apiConnector("POST", CREATE_TASK_ROUTE, values)
    }
}

export function getTasksAPI() {
    return {
        action: (projectId?: string | null, workspaceId?: string | null) => {
            const params = new URLSearchParams();
            if (projectId && projectId.trim() !== "") params.append("projectId", projectId.trim());
            if (workspaceId && workspaceId.trim() !== "") params.append("workspaceId", workspaceId.trim());
            const queryStr = params.toString() ? `?${params.toString()}` : "";
            return apiConnector("GET", `${GET_TASKS_ROUTE}${queryStr}`);
        }
    }
}
