const getAffiliate = require('lib/affiliates/get');
import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

/*
  POST /api/6/affiliates/pay
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
    const affiliate = await getAffiliate(
      db,
      +req.session.uid,
      req.body.timestamp
    );

    const [{ email }] = await db.query(
      'SELECT email FROM users WHERE user_id = ?',
      [req.session.uid]
    );

    const { data: payment } = await axios.post(
      `${CONFIG.XYPAYMENTS_URL}/api/payments`,
      {
        seller_id: CONFIG.XYPAYMENTS_ID,
        seller_key: CONFIG.XYPAYMENTS_KEY,
        methods: ['card', 'crypto'],
        description: 'Ptorx Affiliate',
        info: {
          user_id: req.session.uid,
          credits: affiliate.credits,
          timestamp: req.body.timestamp,
          unpaid_credits: affiliate.unpaid_credits
        },
        email,
        redirect_url: `${
          CONFIG.PTORX_CALLBACK_URL
        }/api/affiliates/pay?payment_id=PAYMENT_ID`,
        amount: affiliate.owed * 100
      }
    );

    res.status(200).json({ url: payment.url });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
};
