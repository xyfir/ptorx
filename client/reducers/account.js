import { PURCHASE_SUBSCRIPTION } from 'constants/actions';
import { ADD_PRIMARY_EMAIL, DELETE_PRIMARY_EMAIL } from 'constants/actions';

export default function(state, action) {
  switch (action.type) {
    case PURCHASE_SUBSCRIPTION:
      return Object.assign({}, state, {
        subscription: action.subscription
      });

    case ADD_PRIMARY_EMAIL:
      return Object.assign({}, state, {
        emails: state.emails.concat([{ id: action.id, address: action.email }])
      });

    case DELETE_PRIMARY_EMAIL:
      return Object.assign({}, state, {
        emails: state.emails.filter(email => {
          return email.id != action.id;
        })
      });

    default:
      return state;
  }
}
