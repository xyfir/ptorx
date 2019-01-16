import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listProxyEmails(
  userId: number
): Promise<Ptorx.ProxyEmailList> {
  const db = new MySQL();
  try {
    const emails = await db.query(
      `
        SELECT
          pxe.id, pxe.name, pxe.created,
          CONCAT(pxe.address, '@', d.domain) AS address
        FROM proxy_emails pxe
        LEFT JOIN domains d ON d.id = pxe.domainId
        WHERE pxe.userId = ?
        ORDER BY pxe.created DESC
      `,
      [userId]
    );
    db.release();
    return emails;
  } catch (err) {
    db.release();
    throw err;
  }
}
