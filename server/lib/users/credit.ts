import { buildMailgunRouteExpression } from 'lib/mg-routes/build-expression';
import { buildMailgunRouteAction } from 'lib/mg-routes/build-action';
import { getProxyEmail } from 'lib/proxy-emails/get';
import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';

/**
 * Adds credits to a users account and reactivates its proxy emails if needed.
 * @async
 * @param {object} db
 * @param {number} user
 * @param {number} amount
 * @return {number} The user's total credits after addition.
 */
export async function creditUser(db, user, amount) {
  // Get user's current amount of credits
  const rows = await db.query('SELECT credits FROM users WHERE userId = ?', [
    user
  ]);
  if (!rows.length) throw 'Could not find user';

  // Add credits to user's account
  const orginal = +rows[0].credits;
  const credits = orginal + amount;
  await db.query('UPDATE users SET credits = ? WHERE userId = ?', [
    credits,
    user
  ]);

  // User had no credits before so we need to reactivate their proxy emails
  if (!orginal) {
    // Load all unrouted proxy emails
    const emails = await db.query(
      `
        SELECT proxyEmailId AS id
        FROM proxy_emails
        WHERE userId = ? AND mgRouteId IS NULL
      `,
      [user]
    );

    /**
     * @typedef {object} EmailRoutePair
     * @prop {number} id
     * @prop {string} mgRouteId
     */
    /** @type {EmailRoutePair[]} */
    const ids = [];

    // Create Mailgun routes
    for (let email_ of emails) {
      try {
        const email = await getProxyEmail(email_.id, user);
        const action = buildMailgunRouteAction(
          email.directForward
            ? { id: email.id, address: email.toEmail }
            : { id: email.id, save: email.saveMail }
        );
        const expression = await buildMailgunRouteExpression(db, {
          saveMail: email.saveMail,
          address: email.address,
          filters: email.filters.map(f => f.id)
        });

        const mailgun = Mailgun({
          apiKey: CONFIG.MAILGUN_KEY,
          domain: email.address.split('@')[1]
        });
        // @ts-ignore
        const mailgunRes = await mailgun.routes().create({
          description: 'Ptorx ' + CONFIG.PROD ? 'prod' : 'dev',
          expression,
          priority: email.spamFilter && !email.saveMail ? 3000 : 1000,
          action
        });

        ids.push({ id: email.id, mgRouteId: mailgunRes.route.id });
      } catch (err) {}
    }

    // Add route id to emails
    if (ids.length) {
      const sql =
        'INSERT INTO proxy_emails (proxyEmailId, mgRouteId) VALUES ' +
        ids.map(() => `(?, ?)`).join(', ') +
        'ON DUPLICATE KEY UPDATE mgRouteId = VALUES(mgRouteId)';
      const vars = [];
      ids.forEach(email => vars.push(email.id, email.mgRouteId));
      await db.query(sql, vars);
    }
  }

  return credits;
}
