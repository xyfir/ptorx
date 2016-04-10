import {
    LOAD_MODIFIERS, ADD_MODIFIER, DELETE_MODIFIER, EDIT_MODIFIER
} from "../types/modifiers";

export function loadModifiers(modifiers) {
    return {
        type: LOAD_MODIFIERS, modifiers
    };
}

export function deleteModifier(id) {
    return {
        type: DELETE_MODIFIER, id
    };
}

export function addModifier(data) {
    return {
        type: ADD_MODIFIER, data
    };
}

export function editModifier(data) {
    return {
        type: EDIT_MODIFIER, data
    };
}