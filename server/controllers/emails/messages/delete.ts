import { MySQL } from 'lib/MySQL';

export async function deleteMessage(req, res) {
  const db = new MySQL();

  try {
    await db.query(
      `
      DELETE FROM messages
      WHERE id = ? AND email_id = (
        SELECT email_id FROM proxy_emails
        WHERE email_id = ? AND user_id = ?
      )
    `,
      [req.params.message, req.params.email, req.session.uid]
    );
    db.release();

    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
