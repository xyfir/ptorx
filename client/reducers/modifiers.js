import {
  LOAD_MODIFIERS,
  ADD_MODIFIER,
  DELETE_MODIFIER,
  EDIT_MODIFIER
} from '../actions/types/modifiers';

export default function(state, action) {
  switch (action.type) {
    case LOAD_MODIFIERS:
      return action.modifiers;

    case ADD_MODIFIER:
      return state.concat([action.data]);

    case EDIT_MODIFIER:
      return (() => {
        let temp = state.slice(0);

        temp.forEach((mod, i) => {
          if (action.data.id == mod.id) temp[i] = action.data;
        });

        return temp;
      }).call();

    case DELETE_MODIFIER:
      return state.filter(mod => {
        return mod.id != action.id;
      });

    default:
      return state;
  }
}
