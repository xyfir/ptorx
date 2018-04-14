const mysql = require('lib/mysql');

/*
  GET api/emails/:email/messages
  OPTIONAL
    type: number
  RETURN
    {
      error: boolean, message?: string,
      messages: [{
        id: string, received: number, subject: string
      }]
    }
  DESCRIPTION
    Return basic data on any stored messages for :email
    Returns accepted, rejected, or spam messages based on req.query.type
*/
module.exports = async function(req, res) {
  const db = new mysql();

  try {
    await db.getConnection();
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
    `,
      [req.query.type, req.params.email, req.session.uid]
    );
    db.release();

    res.json({ error: false, messages });
  } catch (err) {
    db.release();
    res.json({ error: true, message: err, messages: [] });
  }
};
