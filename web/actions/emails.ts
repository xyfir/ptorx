import { LOAD_EMAILS, DELETE_EMAIL } from 'constants/actions';

export function loadEmails(emails) {
  return {
    type: LOAD_EMAILS,
    emails
  };
}

export function deleteEmail(id) {
  return {
    type: DELETE_EMAIL,
    id
  };
}
