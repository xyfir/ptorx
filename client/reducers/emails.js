import { LOAD_EMAILS, DELETE_EMAIL } from 'constants/actions';

export default function(state, action) {
  switch (action.type) {
    case LOAD_EMAILS:
      return action.emails;

    case DELETE_EMAIL:
      return state.filter(email => email.id != action.id);

    default:
      return state;
  }
}
