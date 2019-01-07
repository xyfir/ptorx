import { MySQL } from 'lib/MySQL';

export async function setEmailTemplate(req, res) {
  const db = new MySQL();

  try {
    const result = await db.query(
      `UPDATE users SET email_template = ? WHERE user_id = ?`,
      [req.body.id, req.session.uid]
    );
    if (!result.affectedRows) throw 'Could not set template';

    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }

  db.release();
}
