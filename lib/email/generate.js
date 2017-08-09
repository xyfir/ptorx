const rword = require('rword');

/**
 * Find and returns an available proxy email address.
 * @async
 * @param {object} db - A connected instance of `lib/mysql`.
 * @return {string}
 */
module.exports = async function(db) {

  const sql = `
    SELECT email_id FROM redirect_emails WHERE address = ?
  `;
  let email = rword.generateFromPool(1);

  while (true) {
    email += Date.now().toString().substr(-2);
    const rows = await db.query(sql, [email + '@ptorx.com']);

    if (!rows.length) return email + '@ptorx.com';
  }

};