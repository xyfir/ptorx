import { MySQL } from 'lib/MySQL';
const uuid = require('uuid/v4');

/*
  POST /api/affiliates/key
  RETURN
    { api_key: string }
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const api_key = uuid();


    const result = await db.query(
      'UPDATE affiliates SET api_key = ? WHERE user_id = ?',
      [api_key, req.session.uid]
    );
    if (!result.affectedRows) throw 'Could not generate key';
    db.release();

    res.status(200).json({ api_key });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err.toString() });
  }
};
