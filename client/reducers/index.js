// Reducers
import account from "./account";

import { INITIALIZE_STATE, CHANGE_VIEW } from "../actions/types/";

export default function (state, action) {

    if (action.type == INITIALIZE_STATE)
        return action.state;
    else if (state == undefined)
        return {};

    return {
        account: account(state.account, action)
    };

}