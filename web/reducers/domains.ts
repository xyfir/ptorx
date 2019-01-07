import { ADD_DOMAIN } from 'constants/actions';

export function domainsReducer(state, action) {
  switch (action.type) {
    case ADD_DOMAIN:
      return state.concat([action.data]);

    default:
      return state;
  }
}
