import { apiConnector } from "../APIConector";
import { workspaceEndPoints } from "../apiEndpoints";
import { SaveWorkspacePayload } from "@/types/workspace";

const { CREATE_WORKSPACE_ROUTE, GET_WORKSPACE_ROUTE } = workspaceEndPoints;

export function createWorkSpaceAPI() {
    return {
        action: (values: SaveWorkspacePayload) => apiConnector("POST", `${CREATE_WORKSPACE_ROUTE}`, values)
    }
}
export function fetchWorkSpaceAPI() {
    return {
        action: () => apiConnector("GET", `${GET_WORKSPACE_ROUTE}`)
    }
}
