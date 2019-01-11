import { Request, Response } from 'express';
import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function api_getMessage(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const [message] = await db.query(
      `
      SELECT
        url AS url, received
      FROM
        messages AS m, proxy_emails AS pxe
      WHERE
        m.id = ? AND pxe.proxyEmailId = ? AND pxe.userId = ? AND
        m.received + 255600 > UNIX_TIMESTAMP() AND
        m.proxyEmailId = pxe.proxyEmailId
    `,
      [req.params.message, req.params.email, req.session.uid]
    );
    db.release();

    if (!message) throw 'Could not find message';

    // Cannot load message with mailgun-js
    const { data } = await axios.get(message.url, {
      auth: { username: 'api', password: CONFIG.MAILGUN_KEY }
    });

    res.status(200).json({
      ...message,
      text: data['body-plain'],
      html: data['body-html'],
      headers: data['message-headers'],
      from: data.from,
      subject: data.subject
    });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
