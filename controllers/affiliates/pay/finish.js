const request = require('superagent');
const CONFIG = require('config');
const MySQL = require('lib/mysql');

/*
  GET /api/affiliates/pay
  REQUIRED
    payment_id: number
  DESCRIPTION
    Finish purchase and redirect user
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const { body: payment } = await request
      .get(
        `${CONFIG.addresses.xyPayments}/api/payments/${req.query.payment_id}`
      )
      .query({
        seller_id: CONFIG.ids.xyPayments,
        seller_key: CONFIG.keys.xyPayments
      });

    if (payment.fulfilled) throw 'Payment was already fulfilled';
    if (payment.paid === null) throw 'Payment was not paid';
    if (payment.info.user_id != req.session.uid) throw 'Wrong user';

    await db.getConnection();

    /**
     * The total amount of subscriptions paid for by affiliate
     * @type {number}
     */
    const subscriptions =
      payment.info.subscriptions + payment.info.unpaid_subscriptions;
    // Discount must be between 99 ($0.99) and 249 ($2.49)
    const discount =
      99 > subscriptions ? 99 : subscriptions > 249 ? 249 : subscriptions;

    await db.query(
      `
        UPDATE affiliates SET
          discount = ?, subscriptions = ?, last_payment = NOW()
        WHERE user_id = ?
      `,
      [discount, subscriptions, req.session.uid]
    );

    // Mark payment fulfilled
    await request
      .post(
        `${CONFIG.addresses.xyPayments}/api/payments/` +
          `${req.query.payment_id}/fulfill`
      )
      .send({
        seller_id: CONFIG.ids.xyPayments,
        seller_key: CONFIG.keys.xyPayments
      });
  } catch (err) {}

  db.release();
  res.redirect('/affiliate');
};
