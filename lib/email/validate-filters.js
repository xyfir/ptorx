/**
 * Validates a user's chosen filters for a proxy email. Throws an error 
 * message on invalid data.
 * @async
 * @param {number[]} filters
 * @param {number} uid
 * @param {object} db
 */
module.exports = async function(filters, uid, db) {

  // No filters to validate
  if (!filters.length) return;

  // Validate that all filters exist and user has access to them
  const sql = `
    SELECT type, accept_on_match, use_regex FROM filters
    WHERE filter_id IN (?) AND user_id = ?
  `,
  vars = [
    filters, uid
  ],
  rows = await db.query(sql, vars);
  
  if (rows.length != filters.length)
    throw 'One or more filters provided do not exist';

  let types = [];

  // Validate filter types and count
  for (let row of rows) {
    if (types.indexOf(row.type) > -1 && row.type != 6)
      throw 'Cannot have multiple non-header filters';

    types.push(row.type);
  }

};