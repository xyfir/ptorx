import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function deleteDomain(req, res) {
  const db = new MySQL();

  try {
    const [domain] = await db.query(
      'SELECT domain FROM domains WHERE id = ? AND user_id = ?',
      [req.params.domain, req.session.uid]
    );

    if (!domain) throw 'Could not find domain';

    await axios.delete(`${CONFIG.MAILGUN_URL}/domains/${domain.domain}`);

    await db.query('DELETE FROM domains WHERE id = ?', [req.params.domain]);
    db.release();

    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
