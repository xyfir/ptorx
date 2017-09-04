const request = require('superagent');
const config = require('config');
const mysql = require('lib/mysql');

/*
  GET api/emails/:email/messages/:message
  RETURN
    {
      error: boolean, message?: string,
      headers?: [[ header: string, value: string ]],
      from?: string, subject?: string, text?: string, html?: string
    }
  DESCRIPTION
    Return message content
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [message] = await db.query(`
      SELECT
        message_url AS url
      FROM
        messages AS m, redirect_emails AS re
      WHERE
        m.message_key = ? AND re.email_id = ? AND re.user_id = ? AND
        m.received + 255600 > UNIX_TIMESTAMP() AND
        m.email_id = re.email_id
    `, [
      req.params.message, req.params.email, req.session.uid
    ]);
    db.release();

    if (!message) throw 'Could not find message';

    // Cannot load message with mailgun-js
    const {body: data} = await request
      .get(message.url)
      .auth('api', config.keys.mailgun);

    res.json({
      text: data['body-plain'], html: data['body-html'],
      error: false, headers: data['message-headers'],
      from: data.from, subject: data.subject
    });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err.toString() });
  }

};