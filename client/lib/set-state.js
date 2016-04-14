// Action creators
import { changeView } from "../actions/creators/";

// Constants
import * as VIEWS from "../constants/views";

export default function(store) {

    // Hash is empty or not set    
    if (location.hash.length < 2) {
        store.dispatch(changeView(VIEWS.CREATE_REDIRECT_EMAIL));
        return;
    }

    const state = store.getState();
    const hash = location.hash.substr(1).split('/');

    // Update state to reflect hash
    if (hash[0] == "account") {
        if (hash[1] == "purchase-subscription")
            store.dispatch(changeView(VIEWS.PURCHASE_SUBSCRIPTION));
        else
            store.dispatch(changeView(VIEWS.ACCOUNT));
    }
    else if (hash[0] == "filters") {
        switch (hash[1]) {
            case "create":
                return store.dispatch(changeView(VIEWS.CREATE_FILTER));
            case "edit":
                return store.dispatch(changeView(VIEWS.EDIT_FILTER));
            case "list":
                return store.dispatch(changeView(VIEWS.LIST_FILTERS));
        }
    }
    else if (hash[0] == "modifiers") {
        switch (hash[1]) {
            case "create":
                return store.dispatch(changeView(VIEWS.CREATE_MODIFIER));
            case "edit":
                return store.dispatch(changeView(VIEWS.EDIT_MODIFIER));
            case "list":
                return store.dispatch(changeView(VIEWS.LIST_MODIFIERS));
        }
    }
    else if (hash[0] == "emails") {
        switch (hash[1]) {
            case "create":
                return store.dispatch(changeView(VIEWS.CREATE_EMAIL));
            case "edit":
                return store.dispatch(changeView(VIEWS.EDIT_EMAIL));
            case "list":
                return store.dispatch(changeView(VIEWS.LIST_EMAILS));
        }
    }
    
}