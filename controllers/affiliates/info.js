const moment = require('moment');
const MySQL = require('lib/mysql');

/*
  GET /api/affiliates
  RETURN
    {
      user_id: number, api_key: string, subscriptions: number,
      discount: number, last_payment: string, owed: number,
      timestamp: string
    }
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    await db.getConnection();
    const [affiliate] = await db.query(
      'SELECT * FROM affiliates WHERE user_id = ?',
      [req.session.uid]
    );
    if (!affiliate) throw 'You are not an affiliate';

    affiliate.timestamp = moment().format('YYYY-MM-DD HH:MM:SS');
    const [{ unpaid_subscriptions }] = await db.query(
      `
        SELECT COUNT(user_id) AS unpaid_subscriptions
        FROM affiliate_created_users
        WHERE affiliate_id = ? AND created_at BETWEEN ? AND ?
      `,
      [req.session.uid, affiliate.last_payment, affiliate.timestamp]
    );

    affiliate.owed = +(
      unpaid_subscriptions *
      (9.0 - affiliate.discount / 100)
    ).toFixed(2);

    res.status(200).json(affiliate);
  } catch (err) {
    db.release();
    res.status(400).json({ message: err.toString() });
  }
};
