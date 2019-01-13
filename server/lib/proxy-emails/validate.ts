/**
 * Validates a proxy email's values that aren't modifiers or filters. Throws
 * an error message on invalid data.
 * @param {object} email
 */
export function validateProxyEmail(email) {
  if (!(email.name || '').match(/^.{1,40}$/)) throw 'Invalid name';
  if (email.address && !/^[\w+-]{1,64}$/.test(email.address))
    throw 'Invalid email address characters or length';
  if (email.directForward && (email.noToAddress || email.saveMail))
    throw 'Cannot use "no redirect" or "save mail" with "direct forward"';
}
