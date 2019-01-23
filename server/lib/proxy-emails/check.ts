import { MySQL } from 'lib/MySQL';
import { Ptorx } from 'typings/ptorx';

export async function checkProxyEmail(
  domainId: Ptorx.ProxyEmail['domainId'],
  address: Ptorx.ProxyEmail['address']
): Promise<{ available: boolean }> {
  const db = new MySQL();
  try {
    const rows: { inTable: number }[] = await db.query(
      `
        SELECT COUNT(id) AS inTable FROM proxy_emails
        WHERE address = ? AND domainId = ?
        UNION
        SELECT COUNT(domainId) AS inTable FROM deleted_proxy_emails
        WHERE address = ? AND domainId = ?
      `,
      [address, domainId, address, domainId]
    );
    db.release();
    return { available: rows.findIndex(r => !!r.inTable) == -1 };
  } catch (err) {
    db.release();
    throw err;
  }
}
