import { Request, Response } from 'express';
import { chargeUser } from 'lib/users/charge';
import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function api_sendMessage(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const [row] = await db.query(
      `
        SELECT
          pxe.address, d.domain
        FROM
          domains AS d, proxy_emails AS pxe, users AS u, primary_emails AS pme
        WHERE
          pxe.proxyEmailId = ? AND u.userId = ? AND
          pme.proxyEmailId = pxe.primaryEmailId AND
          pxe.userId = u.userId AND
          d.id = pxe.domainId
      `,
      [req.params.email, req.session.uid]
    );

    if (!row) throw 'Email does not exist';

    const credits = await chargeUser(db, +req.session.uid, 1);
    db.release();

    const mailgun = Mailgun({
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
    res.status(400).json({ error: err });
  }
}
