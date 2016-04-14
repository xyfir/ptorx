import {
    LOAD_EMAILS, ADD_EMAIL, DELETE_EMAIL, EDIT_EMAIL
} from "../actions/types/emails";

export default function(state, action) {
    switch (action.type) {
        case LOAD_EMAILS:
            return action.emails;

        case ADD_EMAIL:
            return state.concat([action.data]);

        case EDIT_EMAIL:
            return (() => {
                let temp = state.slice(0);
                
                temp.forEach((email, i) => {
                    if (action.data.id == email.id)
                        temp[i] = action.data;
                });

                return temp;
            }).call();

        case DELETE_EMAIL:
            return state.filter(email => { return email.id != action.id });
            
        default:
            return state;
    }
}