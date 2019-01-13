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
          pxe.proxyEmailId AS id, pxe.name,
          CONCAT(pxe.address, '@', d.domain) AS address
        FROM
          proxy_emails AS pxe, domains AS d
        WHERE
          pxe.userId = ? AND d.id = pxe.domainId
      `,
      [req.session.uid]
    );
    res.status(200).json(emails);
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
