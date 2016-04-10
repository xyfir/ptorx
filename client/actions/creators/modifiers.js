import {
    LOAD_MODIFIERS, DELETE_MODIFIER
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