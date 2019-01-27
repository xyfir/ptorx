import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getProxyEmail(
  proxyEmailId: number,
  userId: number
): Promise<Ptorx.ProxyEmail> {
  const db = new MySQL();
  try {
    const [proxyEmail]: Ptorx.ProxyEmail[] = await db.query(
      'SELECT * FROM proxy_emails WHERE id = ? AND userId = ?',
      [proxyEmailId, userId]
    );
    if (!proxyEmail) throw 'Could not find email';

    proxyEmail.links = await db.query(
      'SELECT * FROM links WHERE proxyEmailId = ?',
      [proxyEmailId]
    );
    db.release();

    proxyEmail.saveMail = !!proxyEmail.saveMail;

    return proxyEmail;
  } catch (err) {
    db.release();
    throw err;
  }
}
