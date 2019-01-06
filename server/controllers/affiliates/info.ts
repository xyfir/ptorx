const getAffiliate = require('lib/affiliates/get');
const moment = require('moment');
import { MySQL } from 'lib/MySQL';

/*
  GET /api/6/affiliates
  RETURN
    {
      user_id: number, api_key: string, credits: number,
      discount: number, last_payment: string, owed: number,
      timestamp: string, unpaid_credits: number
    }
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const affiliate = await getAffiliate(
      db,
      +req.session.uid,
      moment().format('YYYY-MM-DD HH:mm:ss')
    );
    db.release();
    res.status(200).json(affiliate);
  } catch (err) {
    db.release();
    res.status(400).json({ message: err.toString() });
  }
};
