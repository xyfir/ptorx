import {
    LOAD_EMAILS, ADD_EMAIL, DELETE_EMAIL, EDIT_EMAIL
} from "../types/emails";

export function loadEmails(emails) {
    return {
        type: LOAD_EMAILS, emails
    };
}

export function deleteEmail(id) {
    return {
        type: DELETE_EMAIL, id
    };
}

export function addEmail(data) {
    return {
        type: ADD_EMAIL, data
    };
}

export function editEmail(data) {
    return {
        type: EDIT_EMAIL, data
    };
}