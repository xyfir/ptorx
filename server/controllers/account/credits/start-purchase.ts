import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

/**
 * `POST /api/account/credits/purchase`
 * @param {object} req
 * @param {object} req.body
 * @param {string} req.body.type - `"normal|iap"`
 * @param {number} req.body.package - `1|2|3`
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {string} [url]
 */
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const [user] = await db.query(
      'SELECT email, referral FROM users WHERE user_id = ?',
      [req.session.uid]
    );
    if (!user) throw 'No user';
    db.release();

    const referral = JSON.parse(user.referral);
    referral.hasMadePurchase = true;

    const methods = (() => {
      switch (req.body.type) {
        case 'iap':
          return ['iap'];
        case 'normal':
          return ['card', 'crypto' /*, 'swiftdemand'*/];
      }
    })();

    const payment = await axios.post(`${CONFIG.XYPAYMENTS_URL}/api/payments`, {
      seller_id: CONFIG.XYPAYMENTS_ID,
      seller_key: CONFIG.XYPAYMENTS_KEY,
      product_id: CONFIG.XYPAYMENTS_PRODUCTS[req.body.package],
      methods,
      description: 'Ptorx Premium',
      info: {
        credits: { 1: 8333, 2: 18181, 3: 50000 }[req.body.package],
        user_id: req.session.uid,
        referral
      },
      email: user.email,
      redirect_url: `${
        CONFIG.PTORX_URL
      }/api/account/credits/purchase?payment_id=PAYMENT_ID`
    });

    res.status(200).json({ url: payment.data.url });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
};
