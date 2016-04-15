import {
    LOAD_MESSAGES, DELETE_MESSAGE
} from "../types/messages";

export function loadMessages(messages) {
    return {
        type: LOAD_MESSAGES, messages
    };
}

export function deleteMessage(id) {
    return {
        type: DELETE_MESSAGE, id
    };
}