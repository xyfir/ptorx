const MailGun = require('mailgun-js');
const config = require('config');
const mysql = require('lib/mysql');

/*
  DELETE api/emails/:email/messages/:message
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Delete message from Ptorx and MailGun
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [message] = await db.query(`
      SELECT
        m.message_key AS 'key', d.domain
      FROM
        messages AS m, domains AS d, redirect_emails AS re
      WHERE
        m.message_key = ? AND re.email_id = ? AND re.user_id = ? AND
        m.email_id = re.email_id AND d.id = re.domain_id
    `, [
      req.params.message, req.params.email, req.session.uid
    ]);

    if (!message) throw 'Could not find message';

    await db.query(
      'DELETE FROM messages WHERE message_key = ? AND email_id = ?',
      [req.params.message, req.params.email]
    );
    db.release();

    const mailgun = MailGun({
      apiKey: config.keys.mailgun, domain: message.domain
    });

    await mailgun.messages(message.key).delete();

    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err.toString() });
  }

};