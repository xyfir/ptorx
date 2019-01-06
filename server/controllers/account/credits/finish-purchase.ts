import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

/**
 * `GET /api/6/account/credits/purchase`
 * @param {object} req
 * @param {object} req.query
 * @param {number} req.query.payment_id
 */
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const payment = await axios.get(
      `${CONFIG.XYPAYMENTS_URL}/api/payments/${req.query.payment_id}`,
      {
        params: {
          seller_id: CONFIG.XYPAYMENTS_ID,
          seller_key: CONFIG.XYPAYMENTS_KEY
        }
      }
    );

    if (payment.data.fulfilled) throw 'Payment was already fulfilled';
    if (payment.data.paid === null) throw 'Payment was not paid';
    if (payment.data.info.user_id != req.session.uid) throw 'Wrong user';

    // Update user's account

    await db.query(
      `
        UPDATE users SET credits = ?, referral = ?
        WHERE user_id = ?
      `,
      [
        payment.data.info.credits,
        JSON.stringify(payment.data.info.referral),
        req.session.uid
      ]
    );

    // Mark payment fulfilled
    await axios.post(
      `${CONFIG.XYPAYMENTS_URL}/api/payments/` +
        `${req.query.payment_id}/fulfill`,
      {
        seller_id: CONFIG.XYPAYMENTS_ID,
        seller_key: CONFIG.XYPAYMENTS_KEY
      }
    );
  } catch (err) {}

  db.release();
  res.redirect('/app/');
};
