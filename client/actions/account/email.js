import { ADD_PRIMARY_EMAIL, DELETE_PRIMARY_EMAIL } from 'constants/actions';

export function addEmail(id, email) {
  return {
    type: ADD_PRIMARY_EMAIL,
    id,
    email
  };
}

export function deleteEmail(id) {
  return {
    type: DELETE_PRIMARY_EMAIL,
    id
  };
}
