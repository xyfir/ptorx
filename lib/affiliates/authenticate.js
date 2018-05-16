const auth = require('basic-auth');

/**
 * @typedef {object} BasicAuthResult
 * @prop {number} id
 * @prop {string} key
 */
/**
 * Validate affiliate id / key.
 * @param {object} db
 * @param {object} req
 * @throws {string}
 * @return {BasicAuthResult}
 */
module.exports = async function(db, req) {
  const cred = auth(req);
  const rows = await db.query(
    'SELECT user_id FROM affiliates WHERE user_id = ? AND api_key = ?',
    [cred.name, cred.pass]
  );
  if (!rows.length) throw 'Invalid affiliate id and/or key';

  return {
    id: +cred.name,
    key: cred.pass
  };
};
