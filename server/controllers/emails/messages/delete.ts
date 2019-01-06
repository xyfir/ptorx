import { MySQL } from 'lib/MySQL';

/*
  DELETE api/emails/:email/messages/:message
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Delete message from Ptorx
*/
module.exports = async function(req, res) {
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

    res.json({ error: false });
  } catch (err) {
    db.release();
    res.json({ error: true, message: err.toString() });
  }
};
