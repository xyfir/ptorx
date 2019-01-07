import { LOAD_MESSAGES, DELETE_MESSAGE } from 'constants/actions';

export function messagesReducer(state, action) {
  switch (action.type) {
    case LOAD_MESSAGES:
      return action.messages;

    case DELETE_MESSAGE:
      return state.filter(m => m.id != action.id);

    default:
      return state;
  }
}
