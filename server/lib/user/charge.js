const MailGun = require('mailgun-js');
const config = require('config');

/**
 * Charges a user's account credits. If not enough credits are available it
 *  fails. If all credits are used by the action then the user's emails are
 *  deactivated but the action will not fail.
 * @async
 * @param {object} db
 * @param {number} user
 * @param {number} amount
 * @return {number} The user's remaining credits after charge.
 * @throws {string}
 */
module.exports = async function(db, user, amount) {
  const rows = await db.query('SELECT credits FROM users WHERE user_id = ?', [
    user
  ]);
  if (!rows.length) throw 'Could not find user';

  let credits = +rows[0].credits;
  if (amount > credits) throw `No credits! Need ${amount}, have ${credits}.`;
  credits -= amount;

  await db.query('UPDATE users SET credits = ? WHERE user_id = ?', [
    credits,
    user
  ]);

  if (!credits) {
    // Load all routed proxy emails
    const emails = await db.query(
      `
        SELECT
          pxe.email_id AS id, pxe.mg_route_id AS mgRouteId, d.domain
        FROM
          proxy_emails AS pxe, domains AS d
        WHERE
          pxe.user_id = ? AND pxe.mg_route_id IS NOT NULL
          AND d.id = pxe.domain_id
      `,
      [user]
    );

    /** @type {number[]} */
    const ids = [];

    // Delete MailGun routes
    for (let email of emails) {
      const mailgun = MailGun({
        apiKey: config.keys.mailgun,
        domain: email.domain
      });
      try {
        await mailgun.routes(email.mgRouteId).delete();
        ids.push(email.id);
      } catch (err) {}
    }

    await db.query(
      'UPDATE proxy_emails SET mg_route_id = NULL WHERE email_id IN (?)',
      [ids]
    );
  }

  return credits;
};
