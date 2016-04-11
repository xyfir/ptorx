// Reducers
import modifiers from "./modifiers";
import filters from "./filters";
import account from "./account";
import emails from "./emails";

import { INITIALIZE_STATE, CHANGE_VIEW } from "../actions/types/";

export default function (state, action) {

    if (action.type == INITIALIZE_STATE)
        return action.state;
    else if (state == undefined)
        return {};
    else if (action.type == CHANGE_VIEW)
        return Object.assign({}, state, { view: action.view });

    return {
        modifiers: modifiers(state.modifiers, action),
        filters: filters(state.filters, action),
        account: account(state.account, action),
        emails: emails(state.emails, action)
    };

}