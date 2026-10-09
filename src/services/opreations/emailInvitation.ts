import { apiConnector } from "../APIConector";
import { emailInvitationEndPoints } from "../apiEndpoints";

const { EMAIL_INVITATION_ROUTE, CHECK_EMAIL_INVITATION_TOKEN, GET_EMAIL_INVITATION_lIST } = emailInvitationEndPoints;

export function emailInvitationAPI() {
    return {
        action: (values: { email: string, workspaceId: string, role: string }) => apiConnector("POST", `${EMAIL_INVITATION_ROUTE}`, values)
    }
}

export function checkInvitationTokenAPI() {
    return {
        action: (token: string) => apiConnector("GET", `${CHECK_EMAIL_INVITATION_TOKEN}?token=${token}`)
    }
}

export function getEmailInvitationList() {
    return {
        action: () => apiConnector("GET", `${GET_EMAIL_INVITATION_lIST}`)
    }
}