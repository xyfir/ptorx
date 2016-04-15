import {
    LOAD_MESSAGES, DELETE_MESSAGE
} from "../actions/types/messages";

export default function(state, action) {
    switch (action.type) {
        case LOAD_MESSAGES:
            return action.messages;

        case DELETE_MESSAGE:
            return state.filter(m => { return m.id != action.id });
            
        default:
            return state;
    }
}