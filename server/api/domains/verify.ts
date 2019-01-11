import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function api_verifyDomain(req, res) {
  const db = new MySQL();

  try {
    const [domain] = await db.query(
      'SELECT id, domain AS name FROM domains WHERE id = ?',
      [req.params.domain]
    );

    if (!domain) throw 'Could not find domain';

    const mgRes = await axios.put(
      `${CONFIG.MAILGUN_URL}/domains/${domain.name}/verify`
    );
    if (mgRes.data.domain.state == 'unverified')
      throw 'Could not verify domain';

    await db.query('UPDATE domains SET verified = 1 WHERE id = ?', [domain.id]);
    db.release();

    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
