const chargeUser = require('lib/user/charge');
const MailGun = require('mailgun-js');
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

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

    const [row] = await db.query(
      `
        SELECT
          pxe.address, d.domain
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

    const credits = await chargeUser(db, +req.session.uid, 1);
    db.release();

    const mailgun = MailGun({
      apiKey: CONFIG.MAILGUN_KEY,
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
