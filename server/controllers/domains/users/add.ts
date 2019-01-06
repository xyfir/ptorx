import axios from 'axios';
import { MySQL } from 'lib/MySQL';

/*
  POST api/domains/:domain/users
  REQUIRED
    key: string, label: string
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Completes process of adding another Ptorx user to a domain
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const result = await db.query(
      `
      UPDATE domain_users SET
        label = ?, added = NOW(), authorized = 1
      WHERE
        domain_id = ? AND request_key = ? AND
        (SELECT user_id FROM domains WHERE id = ?) = ?
    `,
      [
        req.body.label,
        req.params.domain,
        req.body.key,
        req.params.domain,
        req.session.uid
      ]
    );
    db.release();

    if (!result.affectedRows) throw 'Could not add user to domain';

    res.json({ error: false });
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
