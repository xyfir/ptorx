import {
  LOAD_FILTERS,
  ADD_FILTER,
  DELETE_FILTER,
  EDIT_FILTER
} from 'constants/actions';

export function filtersReducer(state, action) {
  switch (action.type) {
    case LOAD_FILTERS:
      return action.filters;

    case ADD_FILTER:
      return state.concat([action.data]);

    case EDIT_FILTER:
      return (() => {
        let temp = state.slice(0);
        temp.forEach((f, i) => {
          if (action.data.id == f.id) temp[i] = action.data;
        });
        return temp;
      })();

    case DELETE_FILTER:
      return state.filter(f => {
        return f.id != action.id;
      });

    default:
      return state;
  }
}
