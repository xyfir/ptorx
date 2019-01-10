import { MySQL } from 'lib/MySQL';

export async function getMessages(req, res) {
  const db = new MySQL();

  try {
    const messages = await db.query(
      `
        SELECT
          m.id, m.received, m.subject
        FROM
          messages AS m, proxy_emails AS pxe
        WHERE
          m.email_id = pxe.email_id AND m.type = ? AND
          m.received + 255600 > UNIX_TIMESTAMP() AND
          pxe.email_id = ? AND pxe.user_id = ?
        ORDER BY m.received DESC
      `,
      [req.query.type, req.params.email, req.session.uid]
    );
    db.release();

    res.status(200).json({ messages });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
