/**
 * Validates a user's chosen filters for a proxy email. Throws an error
 * message on invalid data.
 * @async
 * @param {number[]} filters
 * @param {number} uid
 * @param {boolean} directForward
 * @param {object} db
 */
export async function validateProxyEmailFilters(
  filters,
  uid,
  directForward,
  db
) {
  // No filters to validate
  if (!filters.length) return;

  // Validate that all filters exist and user has access to them
  const sql = `
    SELECT type, accept_on_match AS acceptOnMatch
    FROM filters
    WHERE filter_id IN (?) AND user_id = ?
  `,
    vars = [filters, uid],
    rows = await db.query(sql, vars);

  if (rows.length != filters.length)
    throw 'One or more filters provided do not exist';

  const types = [];

  for (let row of rows) {
    if (types.indexOf(row.type) > -1 && row.type != 6)
      throw 'Cannot have multiple non-header filters';

    if (directForward) {
      if (!row.acceptOnMatch)
        throw 'Cannot use reject on match filters with direct forward enabled';
      if ([4, 5].indexOf(row.type) > -1)
        throw 'Cannot use text/HTML filters with direct forward enabled';
    }

    types.push(row.type);
  }
}
