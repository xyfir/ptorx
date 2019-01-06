import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

/*
  GET /api/6/affiliates/pay
  REQUIRED
    payment_id: number
  DESCRIPTION
    Finish purchase and redirect user
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const { data: payment } = await axios.get(
      `${CONFIG.XYPAYMENTS_URL}/api/payments/${req.query.payment_id}`,
      {
        params: {
          seller_id: CONFIG.XYPAYMENTS_ID,
          seller_key: CONFIG.XYPAYMENTS_KEY
        }
      }
    );

    if (payment.fulfilled) throw 'Payment was already fulfilled';
    if (payment.paid === null) throw 'Payment was not paid';
    if (payment.info.user_id != req.session.uid) throw 'Wrong user';

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
    await axios.post(
      `${CONFIG.XYPAYMENTS_URL}/api/payments/${req.query.payment_id}/fulfill`,
      { seller_id: CONFIG.XYPAYMENTS_ID, seller_key: CONFIG.XYPAYMENTS_KEY }
    );
  } catch (err) {}

  db.release();
  res.redirect('/affiliate');
};
