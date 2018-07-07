import {
  UPDATE_CREDITS,
  ADD_PRIMARY_EMAIL,
  DELETE_PRIMARY_EMAIL
} from 'constants/actions';

export default function(state, action) {
  switch (action.type) {
    case UPDATE_CREDITS:
      return Object.assign({}, state, { credits: action.credits });

    case ADD_PRIMARY_EMAIL:
      return Object.assign({}, state, {
        emails: state.emails.concat([{ id: action.id, address: action.email }])
      });

    case DELETE_PRIMARY_EMAIL:
      return Object.assign({}, state, {
        emails: state.emails.filter(email => email.id != action.id)
      });

    default:
      return state;
  }
}
