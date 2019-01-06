const request = require('superagent');
import * as CONFIG from 'constants/config';
const mysql = require('lib/mysql');

/*
  PUT api/domains/:domain/verify
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Requests that MailGun verify the domain's DNS records and marks the domain
    as verified on Ptorx if MailGun verifies the records.
*/
module.exports = async function(req, res) {
  const db = new mysql();

  try {
    await db.getConnection();
    const [domain] = await db.query(
      'SELECT id, domain AS name FROM domains WHERE id = ?',
      [req.params.domain]
    );

    if (!domain) throw 'Could not find domain';

    const mgRes = await request.put(
      `${CONFIG.MAILGUN_URL}/domains/${domain.name}/verify`
    );

    if (mgRes.body.domain.state == 'unverified')
      throw 'Could not verify domain';

    await db.query('UPDATE domains SET verified = 1 WHERE id = ?', [domain.id]);
    db.release();

    res.json({ error: false });
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
