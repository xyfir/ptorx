import {
  UPDATE_CREDITS,
  ADD_PRIMARY_EMAIL,
  SET_EMAIL_TEMPLATE,
  DELETE_PRIMARY_EMAIL
} from 'constants/actions';

/**
 * @param {number} id
 * @param {string} email
 */
export function addEmail(id, email) {
  return {
    type: ADD_PRIMARY_EMAIL,
    id,
    email
  };
}

/** @param {number} id */
export function setEmailTemplate(id) {
  return { type: SET_EMAIL_TEMPLATE, id };
}

/** @param {number} id */
export function deleteEmail(id) {
  return {
    type: DELETE_PRIMARY_EMAIL,
    id
  };
}

/** @param {number} credits */
export function updateCredits(credits) {
  return {
    type: UPDATE_CREDITS,
    credits
  };
}
