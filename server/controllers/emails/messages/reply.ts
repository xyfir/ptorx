const chargeUser = require('lib/user/charge');
const MailGun = require('mailgun-js');
import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function replyToMessage(req, res) {
  const db = new MySQL();

  try {
    const [row] = await db.query(
      `
        SELECT
          pxe.address, d.domain, m.message_url AS msgUrl
        FROM
          messages AS m, domains AS d, proxy_emails AS pxe, users AS u
        WHERE
          m.id = ? AND pxe.email_id = ? AND u.user_id = ? AND
          m.received + 255600 > UNIX_TIMESTAMP() AND pxe.user_id = u.user_id AND
          m.email_id = pxe.email_id AND d.id = pxe.domain_id
      `,
      [req.params.message, req.params.email, req.session.uid]
    );

    if (!row) throw 'Message does not exist';

    const credits = await chargeUser(db, +req.session.uid, 1);
    db.release();

    // Get original messages' data
    // Cannot load message with mailgun-js
    const { data: message } = await axios.get(row.msgUrl, {
      auth: { username: 'api', password: CONFIG.MAILGUN_KEY }
    });

    const mailgun = MailGun({
      apiKey: CONFIG.MAILGUN_KEY,
      domain: row.domain
    });

    // Send reply
    await mailgun.messages().send({
      to: message.sender,
      from: row.address + '@' + row.domain,
      text: req.body.content,
      subject: 'Re: ' + message.subject
    });

    res.status(200).json({ credits });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
