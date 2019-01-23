import { getProxyEmail } from 'lib/proxy-emails/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteProxyEmail(
  proxyEmailId: Ptorx.ProxyEmail['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    const proxyEmail = await getProxyEmail(proxyEmailId, userId);
    await db.query('INSERT INTO deleted_proxy_emails SET ?', {
      domainId: proxyEmail.domainId,
      address: proxyEmail.address
    });
    await db.query('DELETE FROM proxy_emails WHERE id = ?', [proxyEmailId]);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
