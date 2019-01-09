import { getProxyEmail as _getProxyEmail } from 'lib/emails/get';
import { MySQL } from 'lib/MySQL';

export async function getProxyEmail(req, res) {
  const db = new MySQL();

  try {
    const email = await _getProxyEmail(db, {
      user: +req.session.uid,
      email: +req.params.email
    });
    db.release();
    res.status(200).json(email);
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
