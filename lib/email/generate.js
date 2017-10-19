const rword = require('rword');

/**
 * Generates an available proxy email address.
 * @async
 * @param {object} db - A connected instance of `lib/mysql`.
 * @param {number} domain
 * @return {string}
 */
module.exports = async function(db, domain) {

  const sql = `
    SELECT email_id FROM proxy_emails WHERE address = ? AND domain_id = ?
  `;
  let email = rword.generateFromPool(1);

  while (true) {
    email += Date.now().toString().substr(-2);
    const rows = await db.query(sql, [email, domain]);

    if (!rows.length) return email;
  }

};