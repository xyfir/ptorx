const getAffiliate = require('lib/affiliates/get');
const request = require('superagent');
const CONFIG = require('config');
const MySQL = require('lib/MySQL');

/*
  POST /api/affiliates/pay
  REQUIRED
    timestamp: string
  RETURN
    { message?: string, url?: string }
  DESCRIPTION
    Initialize payment with xyPayments
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    await db.getConnection();
    const affiliate = await getAffiliate(
      db,
      +req.session.uid,
      req.body.timestamp
    );

    const [{ email }] = await db.query(
      'SELECT email FROM users WHERE user_id = ?',
      [req.session.uid]
    );

    const { body: payment } = await request
      .post(`${CONFIG.addresses.xyPayments}/api/payments`)
      .send({
        seller_id: CONFIG.ids.xyPayments,
        seller_key: CONFIG.keys.xyPayments,
        methods: ['card', 'crypto'],
        description: 'Ptorx Affiliate',
        info: {
          user_id: req.session.uid,
          timestamp: req.body.timestamp,
          subscriptions: affiliate.subscriptions,
          unpaid_subscriptions: affiliate.unpaid_subscriptions
        },
        email,
        redirect_url:
          `${CONFIG.addresses.ptorx.callback}api/affiliates/pay` +
          `?payment_id=PAYMENT_ID`,
        amount: affiliate.owed * 100
      });

    res.status(200).json({ url: payment.url });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
};
