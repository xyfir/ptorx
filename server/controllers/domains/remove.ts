const request = require('superagent');
import * as CONFIG from 'constants/config';
const mysql = require('lib/mysql');

/*
  DELETE api/domains/:domain
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Remove a domain from Ptorx
*/
module.exports = async function(req, res) {
  const db = new mysql();

  try {
    await db.getConnection();
    const [domain] = await db.query(
      'SELECT domain FROM domains WHERE id = ? AND user_id = ?',
      [req.params.domain, req.session.uid]
    );

    if (!domain) throw 'Could not find domain';

    await request.delete(`${CONFIG.MAILGUN_URL}/domains/${domain.domain}`);

    await db.query('DELETE FROM domains WHERE id = ?', [req.params.domain]);
    db.release();

    res.json({ error: false });
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
