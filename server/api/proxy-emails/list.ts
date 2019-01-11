import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getProxyEmails(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();
  try {
    const emails = await db.query(
      `
        SELECT
          pxe.email_id AS id, pxe.name, pxe.description,
          CONCAT(pxe.address, '@', d.domain) AS address
        FROM
          proxy_emails AS pxe, domains AS d
        WHERE
          pxe.user_id = ? AND d.id = pxe.domain_id
      `,
      [req.session.uid]
    );
    res.status(200).json(emails);
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
