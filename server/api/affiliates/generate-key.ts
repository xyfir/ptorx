import { MySQL } from 'lib/MySQL';
import * as uuid from 'uuid/v4';

export async function generateAffiliateKey(req, res) {
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
    res.status(400).json({ error: err });
  }
}
