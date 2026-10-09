import { apiConnector } from "../APIConector";
import { DashbordEndPoints } from "../apiEndpoints";

const { GET_DASHBOARD_TASKS_ROUTE } = DashbordEndPoints;

export function getDashboardTasksAPI() {
    return {
        action: (workspaceId?: string | null) => {
            const query =
                workspaceId &&
                typeof workspaceId === "string" &&
                workspaceId.trim() !== "" &&
                workspaceId !== "undefined" &&
                workspaceId !== "null"
                    ? `?workspaceId=${encodeURIComponent(workspaceId.trim())}`
                    : "";
            return apiConnector("GET", `${GET_DASHBOARD_TASKS_ROUTE}${query}`);
        }
    };
}