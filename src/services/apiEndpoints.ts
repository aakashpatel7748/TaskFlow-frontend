const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1").trim();

export const autthEndPoints = {

    SIGNUP_ROUTE: API_URL + "/user/register",
    GET_LOGIN_ROUTE: API_URL + "/user/login",
    GOOGLE_LOGIN_ROUTE: "/user/auth/google",
    CHECK_USERNAME_ROUTE: API_URL + "/user/check-username-unique",
    LOGOUT_ROUTE: API_URL + "/user/logout",
    // FORGET_PASSWORD_ROUTE: API_URL + "/user/forget-password",

    REFRESH_TOKEN_ROUTE: API_URL + "/user/refresh-token",
}

export const workspaceEndPoints = {
    CREATE_WORKSPACE_ROUTE: API_URL + "/workspace/create",
    GET_WORKSPACE_ROUTE: API_URL + "/workspace/get",
}

export const spaceEndPoints = {
    CREATE_SPACE_ROUTE: API_URL + "/space/create",
    GET_SPACE_ROUTE: API_URL + "/space/get",
    UPDATE_SPACE_ROUTE: API_URL + "/space/update",
    DELETE_SPACE_ROUTE: API_URL + "/space/delete",
}

export const projectEndPoints = {
    CREATE_PROJECT_ROUTE: API_URL + "/project/create",
    GET_PROJECT_ROUTE: API_URL + "/project/get-project",
    GET_ALL_PROJECTS_ROUTE: API_URL + "/project/getAllProjects",
    UPDATE_PROJECT_ROUTE: API_URL + "/project/update",
    DELETE_PROJECT_ROUTE: API_URL + "/project/delete",
}

export const emailInvitationEndPoints = {
    EMAIL_INVITATION_ROUTE: API_URL + "/email/invite",
    CHECK_EMAIL_INVITATION_TOKEN: API_URL + "/email/check-invitation-token",
    GET_EMAIL_INVITATION_lIST: API_URL + "/email/get-email-invitation-list",
}

export const taskEndPoints = {
    CREATE_TASK_ROUTE: API_URL + "/tasks/create",
    GET_TASKS_ROUTE: API_URL + "/tasks/get-tasks",
}

export const DashbordEndPoints = {
    GET_DASHBOARD_TASKS_ROUTE: API_URL + "/dashboard/get-dashboard-tasks",
}
