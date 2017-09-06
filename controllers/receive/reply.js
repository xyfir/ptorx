const MailGun = require('mailgun-js');
const config = require('config');
const mysql = require('lib/mysql');

/*
  POST api/receive/reply
  REQUIRED
    To: string, // message_id--reply@domain.com
    sender: string, // Always 'user@domain'
    subject: string,
    body-plain: string,
  OPTIONAL
    body-html: string
  RETURNS
    HTTP STATUS - 200: Success, 406: Error
  DESCRIPTION
    Reply from a proxy address to the message's original sender
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [row] = await db.query(`
      SELECT
        d.domain,
        m.sender AS originalSender,
        CONCAT(re.address, '@', d.domain) AS proxyAddress
      FROM
        messages AS m, domains AS d, redirect_emails AS re
      WHERE
        m.id = ? AND
        re.email_id = m.email_id AND
        d.id = re.domain_id
    `, [
      req.body.To.split('--reply@')[0]
    ]);
    db.release();

    if (!row) throw 'Invalid / expired message';

    const mailgun = MailGun({
      apiKey: config.keys.mailgun, domain: row.domain
    });

    await mailgun.messages().send({
      subject: req.body.subject,
      text: req.body['body-plain'],
      from: row.proxyAddress,
      html: req.body['body-html'] || '',
      to: row.originalSender
    });

    res.status(200).send();
  }
  catch (err) {
    db.release();
    res.status(406).send();
  }

};