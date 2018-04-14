import { PURCHASE_SUBSCRIPTION } from '../actions/types/account/subscription';
import { ADD_EMAIL, DELETE_EMAIL } from '../actions/types/account/email';

export default function(state, action) {
  switch (action.type) {
    case PURCHASE_SUBSCRIPTION:
      return Object.assign({}, state, {
        subscription: action.subscription
      });

    case ADD_EMAIL:
      return Object.assign({}, state, {
        emails: state.emails.concat([{ id: action.id, address: action.email }])
      });

    case DELETE_EMAIL:
      return Object.assign({}, state, {
        emails: state.emails.filter(email => {
          return email.id != action.id;
        })
      });

    default:
      return state;
  }
}
