/**
 * Validates a user's chosen modifiers for a proxy email. Throws an error 
 * message on invalid data.
 * @param {number[]} modifiers
 * @param {number} uid
 * @param {boolean} directForward
 * @param {object} db
 */
module.exports = async function(modifiers, uid, directForward, db) {

  // No modifiers to validate
  if (!modifiers.length) return;

  if (directForward)
    throw 'Cannot use modifiers with direct forward enabled';

  // Validate that all modifiers exist and user has access to them
  const sql = `
    SELECT type, modifier_id FROM modifiers
    WHERE modifier_id IN (?) AND user_id IN (?)
  `,
  vars = [
    modifiers, [uid, 0]
  ],
  rows = await db.query(sql, vars);

  if (rows.length != modifiers.length)
    throw 'One or more modifiers provided do not exist';

};