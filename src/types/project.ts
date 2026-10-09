export interface ProjectPayloadInterFace {
    _id?: string,
    name: string;
    description?: string;
    isPrivate: boolean;
    workspaceId?: string;
    spaceId?: string;
}