import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getMessages(req: Request, res: Response): Promise<void> {
  const db = new MySQL();
  try {
    const messages = await db.query(
      `
        SELECT
          m.id, m.received, m.subject
        FROM
          messages AS m, proxy_emails AS pxe
        WHERE
          m.proxyEmailId = pxe.proxyEmailId AND m.type = ? AND
          m.received + 255600 > UNIX_TIMESTAMP() AND
          pxe.proxyEmailId = ? AND pxe.userId = ?
        ORDER BY m.received DESC
      `,
      [req.query.type, req.params.email, req.session.uid]
    );
    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
