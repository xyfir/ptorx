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
     * The total amount of credits paid for by affiliate
     * @type {number}
     */
    const credits = payment.info.credits + payment.info.unpaid_credits;
    // Discount is $0.000001 per credit for every 1K credits paid for
    let discount = 0.000001 * Math.floor((credits || 1) / 1000);
    // Discount must be minimum $0.00011 and maximum $0.0002
    discount =
      discount > 0.0002 ? 0.0002 : discount < 0.00011 ? 0.00011 : discount;

    await db.query(
      `
        UPDATE affiliates SET discount = ?, credits = ?, last_payment = NOW()
        WHERE user_id = ?
      `,
      [discount, credits, req.session.uid]
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
