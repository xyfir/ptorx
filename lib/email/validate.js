/**
 * Validate a proxy email.
 * @param {object} email
 * @param {number} subscription
 * @returns {string}
 */
module.exports = function(email, subscription) {
  
  if (Date.now() > subscription)
    return 'You do not have a subscription';    

  if (!(email.name || '').match(/^[\w\s-.@_]{1,40}$/))
    return 'Invalid name';
  if ((email.description || '').length > 150)
    return 'Description character limit hit';
  if (email.address && !/^[\w+-]{1,310}@ptorx.com$/.test(email.address))
    return 'Invalid email address characters or length';

  return 'ok';

};