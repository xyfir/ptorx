const moment = require('moment');

/**
 * @typedef {object} Affiliate
 * @prop {number} user_id
 * @prop {string} api_key
 * @prop {number} credits
 * @prop {number} discount
 * @prop {string} last_payment
 * @prop {number} owed
 * @prop {string} timestamp
 * @prop {number} unpaid_credits
 */
/**
 * @async
 * @param {object} db
 * @param {string} user
 * @param {string} timestamp
 * @return {Affiliate}
 */
export async function getAffiliateInfo(db, user, timestamp) {
  const [affiliate] = await db.query(
    'SELECT * FROM affiliates WHERE user_id = ?',
    [user]
  );
  if (!affiliate) throw 'You are not an affiliate';

  affiliate.timestamp = timestamp;
  affiliate.last_payment = moment(affiliate.last_payment).format(
    'YYYY-MM-DD HH:mm:ss'
  );
  const [{ unpaid_credits }] = await db.query(
    `
      SELECT SUM(credits) AS unpaid_credits
      FROM affiliate_created_users
      WHERE affiliate_id = ? AND created_at > ? AND created_at <= ?
    `,
    [user, affiliate.last_payment, affiliate.timestamp]
  );
  affiliate.unpaid_credits = unpaid_credits;
  affiliate.owed = +(unpaid_credits * (0.0006 - affiliate.discount)).toFixed(2);

  return affiliate;
}
