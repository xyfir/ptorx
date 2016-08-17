import { CHANGE_VIEW } from "../types/index";

export function changeView(view) {
    return {
        type: CHANGE_VIEW, view
    };
}