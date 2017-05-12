import {
  LOAD_EMAILS, ADD_EMAIL, DELETE_EMAIL, EDIT_EMAIL
} from 'actions/types/emails';

export default function(state, action) {

  console.log('reduce state', state, 'action', action);
  
  switch (action.type) {
    case LOAD_EMAILS:
      return action.emails;

    case ADD_EMAIL:
      return state.concat([action.data]);

    case EDIT_EMAIL:
      return (() => {
        const temp = state.slice(0);
        
        temp.forEach((email, i) => {
          if (action.data.id == email.id)
            temp[i] = action.data;
        });

        return temp;
      })();

    case DELETE_EMAIL:
      return state.filter(email => email.id != action.id);
      
    default:
      return state;
  }

}