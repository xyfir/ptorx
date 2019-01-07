import { deleteProxyEmail as _deleteProxyEmail } from 'lib/email/delete';
import { MySQL } from 'lib/MySQL';

export async function deleteProxyEmail(req, res) {
  const db = new MySQL();

  try {
    await _deleteProxyEmail(db, +req.params.email, +req.session.uid);
    db.release();
    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
