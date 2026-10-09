import { spacePayloadInterFace } from "@/types/space";
import { spaceEndPoints, projectEndPoints } from "../apiEndpoints";
import { apiConnector } from "../APIConector";
import { ProjectPayloadInterFace } from "@/types/project";


const { CREATE_PROJECT_ROUTE, GET_ALL_PROJECTS_ROUTE, GET_PROJECT_ROUTE, UPDATE_PROJECT_ROUTE, DELETE_PROJECT_ROUTE } = projectEndPoints;

export function createProjectAPI() {
    return {
        action: (values: ProjectPayloadInterFace) => apiConnector("POST", `${CREATE_PROJECT_ROUTE}?workspaceId=${values.workspaceId}&spaceId=${values.spaceId}`, values)
    }
}

export function updateProjectAPI() {
    return {
        action: (projectId: string, values: Partial<ProjectPayloadInterFace>) => apiConnector("PUT", `${UPDATE_PROJECT_ROUTE}/${projectId}`, values)
    }
}

export function deleteProjectAPI() {
    return {
        action: (projectId: string) => apiConnector("DELETE", `${DELETE_PROJECT_ROUTE}/${projectId}`)
    }
}

export function getAllProjectsAPI() {
    return {
        action: (workspaceId?: string | null, spaceId?: string | null) => {
            const params = new URLSearchParams();
            if (workspaceId && workspaceId !== "undefined" && workspaceId !== "null") {
                params.append("workspaceId", workspaceId);
            }
            if (spaceId && spaceId !== "undefined" && spaceId !== "null") {
                params.append("spaceId", spaceId);
            }
            const queryStr = params.toString() ? `?${params.toString()}` : "";
            return apiConnector("GET", `${GET_ALL_PROJECTS_ROUTE}${queryStr}`);
        }
    }
}

export function getSpaceAllProjectsAPI() {
    return {
        action: (workspaceId: string, spaceId: string) => apiConnector("GET", `${GET_ALL_PROJECTS_ROUTE}?workspaceId=${workspaceId}&spaceId=${spaceId}`)
    }
}

export function getProjectAPI() {
    return {
        action: (workspaceId?: string | null, projectId?: string) => {
            const params = new URLSearchParams();
            if (workspaceId && workspaceId.trim() && workspaceId !== "undefined" && workspaceId !== "null") {
                params.append("workspaceId", workspaceId.trim());
            }
            if (projectId && projectId.trim() && projectId !== "undefined" && projectId !== "null") {
                params.append("projectId", projectId.trim());
            }
            const queryStr = params.toString() ? `?${params.toString()}` : "";
            return apiConnector("GET", `${GET_PROJECT_ROUTE}${queryStr}`);
        }
    }
}