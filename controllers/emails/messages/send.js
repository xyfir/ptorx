const chargeUser = require('lib/user/charge');
const MailGun = require('mailgun-js');
const config = require('config');
const MySQL = require('lib/mysql');

/*
  POST /api/emails/:email/messages
  REQUIRED
    to: string, subject: string, content: string
  RETURN
    { message?: string, credits?: number }
  DESCRIPTION
    Sends an email from a REDIRECT email
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    await db.getConnection();
    const [row] = await db.query(
      `
        SELECT
          pxe.address, d.domain, u.trial
        FROM
          domains AS d, proxy_emails AS pxe, users AS u, primary_emails AS pme
        WHERE
          pxe.email_id = ? AND u.user_id = ? AND
          pme.email_id = pxe.primary_email_id AND
          pxe.user_id = u.user_id AND
          d.id = pxe.domain_id
      `,
      [req.params.email, req.session.uid]
    );

    if (!row) throw 'Email does not exist';
    if (row.trial) throw 'Trial users cannot send mail';

    const credits = await chargeUser(db, +req.session.uid, 1);
    db.release();

    const mailgun = MailGun({
      apiKey: config.keys.mailgun,
      domain: row.domain
    });

    await mailgun.messages().send({
      to: req.body.to,
      from: row.address + '@' + row.domain,
      text: req.body.content,
      subject: req.body.subject
    });

    res.status(200).json({ credits });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
};
