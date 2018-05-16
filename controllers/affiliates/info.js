const getAffiliate = require('lib/affiliates/get');
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
    const affiliate = await getAffiliate(
      db,
      +req.session.uid,
      moment().format('YYYY-MM-DD HH:MM:SS')
    );
    db.release();
    res.status(200).json(affiliate);
  } catch (err) {
    db.release();
    res.status(400).json({ message: err.toString() });
  }
};
