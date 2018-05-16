const MailGun = require('mailgun-js');
const request = require('superagent');
const config = require('config');
const mysql = require('lib/mysql');

/*
  POST api/emails/:email/messages/:message
  REQUIRED
    content: string
  RETURN
    { error: boolean, message: string }
  DESCRIPTION
    Send reply to a stored message
*/
module.exports = async function(req, res) {
  const db = new mysql();

  try {
    await db.getConnection();
    const [row] = await db.query(
      `
      SELECT
        pxe.address, d.domain, m.message_url AS msgUrl, u.trial
      FROM
        messages AS m, domains AS d, proxy_emails AS pxe, users AS u
      WHERE
        m.id = ? AND pxe.email_id = ? AND u.user_id = ? AND
        m.received + 255600 > UNIX_TIMESTAMP() AND pxe.user_id = u.user_id AND
        m.email_id = pxe.email_id AND d.id = pxe.domain_id
    `,
      [req.params.message, req.params.email, req.session.uid]
    );
    db.release();

    if (!row) throw 'Message does not exist';
    if (row.trial) throw 'Trial users cannot reply to mail';

    // Get original messages' data
    // Cannot load message with mailgun-js
    const { body: message } = await request
      .get(row.msgUrl)
      .auth('api', config.keys.mailgun);

    const mailgun = MailGun({
      apiKey: config.keys.mailgun,
      domain: row.domain
    });

    // Send reply
    await mailgun.messages().send({
      to: message.sender,
      from: row.address + '@' + row.domain,
      text: req.body.content,
      subject: 'Re: ' + message.subject
    });

    res.json({ error: false });
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
