const request = require('superagent');
const CONFIG = require('config');
const moment = require('moment');
const MySQL = require('lib/mysql');

/**
 * `GET api/account/purchase`
 * @param {object} req
 * @param {object} req.query
 * @param {number} req.query.payment_id
 */
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const payment = await request
      .get(
        `${CONFIG.addresses.xyPayments}/api/payments/${req.query.payment_id}`
      )
      .query({
        seller_id: CONFIG.ids.xyPayments,
        seller_key: CONFIG.keys.xyPayments
      });

    if (payment.body.fulfilled) throw 'Payment was already fulfilled';
    if (payment.body.paid === null) throw 'Payment was not paid';
    if (payment.body.info.user_id != req.session.uid) throw 'Wrong user';

    // Update user's account
    await db.getConnection();
    await db.query(
      `
      UPDATE users SET subscription = ?, referral = ?, trial = 0
      WHERE user_id = ?
    `,
      [
        payment.body.info.subscription,
        JSON.stringify(payment.body.info.referral),
        req.session.uid
      ]
    );

    // Reward referring user
    if (payment.body.info.refUserSubscription) {
      await db.query('UPDATE users SET subscription = ? WHERE user_id = ?', [
        payment.body.info.refUserSubscription,
        payment.body.info.referral.user
      ]);
    }

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
  } catch (err) {
    11; //
  }

  db.release();
  res.redirect('/app/#/account');
};
