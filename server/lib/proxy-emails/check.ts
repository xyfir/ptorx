import { MySQL } from 'lib/MySQL';
import { Ptorx } from 'typings/ptorx';

export async function checkProxyEmail(
  domainId: Ptorx.ProxyEmail['domainId'],
  address: Ptorx.ProxyEmail['address']
): Promise<{ available: boolean }> {
  const db = new MySQL();
  try {
    const rows = await db.query(
      'SELECT id FROM proxy_emails WHERE address = ? AND domainId = ?',
      [address, domainId]
    );
    db.release();
    return { available: !rows.length };
  } catch (err) {
    db.release();
    throw err;
  }
}
