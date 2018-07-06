import { ADD_EMAIL, DELETE_EMAIL } from 'constants/actions';

export function addEmail(id, email) {
  return {
    type: ADD_EMAIL,
    id,
    email
  };
}

export function deleteEmail(id) {
  return {
    type: DELETE_EMAIL,
    id
  };
}
