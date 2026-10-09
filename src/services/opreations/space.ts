import { spacePayloadInterFace } from "@/types/space";
import { spaceEndPoints } from "../apiEndpoints";
import { apiConnector } from "../APIConector";


const { CREATE_SPACE_ROUTE, GET_SPACE_ROUTE, UPDATE_SPACE_ROUTE, DELETE_SPACE_ROUTE } = spaceEndPoints;

export function createSpaceAPI() {
    return {
        action: (values: spacePayloadInterFace) => apiConnector("POST", `${CREATE_SPACE_ROUTE}`, values)
    }
}

export function getSpaceAPI() {
    return {
        action: (workspaceId: string) => apiConnector("GET", `${GET_SPACE_ROUTE}?workspaceId=${workspaceId}`)
    }
}

export function getSpaceByIdAPI() {
    return {
        action: (spaceId: string) => apiConnector("GET", `${GET_SPACE_ROUTE}/${spaceId}`)
    }
}

export function updateSpaceAPI() {
    return {
        action: (spaceId: string, values: Partial<spacePayloadInterFace>) => apiConnector("PUT", `${UPDATE_SPACE_ROUTE}/${spaceId}`, values)
    }
}

export function deleteSpaceAPI() {
    return {
        action: (spaceId: string) => apiConnector("DELETE", `${DELETE_SPACE_ROUTE}/${spaceId}`)
    }
}