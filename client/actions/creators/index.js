import { CHANGE_VIEW } from "../types/";

export function changeView(view) {
    return {
        type: CHANGE_VIEW, view
    };
}