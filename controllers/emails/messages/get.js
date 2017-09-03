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
        d.domain
      FROM
        messages AS m, domains AS d, redirect_emails AS re
      WHERE
        m.message_key = ? AND re.email_id = ? AND re.user_id = ? AND
        m.received + 255600 > UNIX_TIMESTAMP() AND
        m.email_id = re.email_id AND d.id = re.domain_id
    `, [
      req.params.message, req.params.email, req.session.uid
    ]);
    db.release();

    if (!message) throw 'Could not find message';

    const mgRes = await request.get(
      config.addresses.mailgun + 'domains/' +
      message.domain + '/messages/' + req.params.message
    );

    res.json({
      text: mgRes.body['body-plain'], html: mgRes.body['body-html'],
      error: false, headers: mgRes.body['message-headers'],
      from: mgRes.body.from, subject: mgRes.body.subject
    });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err.toString() });
  }

};