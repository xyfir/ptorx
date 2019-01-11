import { Request, Response } from 'express';
import { chargeUser } from 'lib/users/charge';
import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function api_receiveReply(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const [messageId, domain] = req.body.recipient.split('--reply@');

    const [row] = await db.query(
      `
        SELECT
          m.sender AS originalSender, pxe.user_id AS userId,
          CONCAT(pxe.address, '@', d.domain) AS proxyAddress
        FROM
          messages AS m, domains AS d, proxy_emails AS pxe
        WHERE
          m.id = ? AND
          pxe.email_id = m.email_id AND
          d.id = pxe.domain_id
      `,
      [messageId]
    );

    await chargeUser(db, row.userId, 2);
    db.release();

    const mailgun = Mailgun({
      apiKey: CONFIG.MAILGUN_KEY,
      domain
    });

    // Notify sender that the message cannot be replied to
    if (!row) {
      await mailgun.messages().send({
        subject: req.body.subject,
        text:
          'The message linked to this `Reply-To` address is either expired ' +
          'or for some other reason cannot be found on Ptorx. You will not ' +
          'be able to reply to it. Please start a new conversation with the ' +
          'original sender using the Ptorx app.',
        from: req.body.recipient,
        to: req.body.sender
      });
    }
    // Send reply
    else {
      await mailgun.messages().send({
        subject: req.body.subject,
        text: req.body['body-plain'],
        from: row.proxyAddress,
        html: req.body['body-html'] || '',
        to: row.originalSender
      });
    }

    res.status(200).send();
  } catch (err) {
    db.release();
    res.status(406).send();
  }
}
