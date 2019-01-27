import { getProxyEmail } from 'lib/proxy-emails/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editProxyEmail(
  proxyEmail: Ptorx.ProxyEmail,
  userId: number
): Promise<Ptorx.ProxyEmail> {
  const db = new MySQL();
  try {
    if (proxyEmail.address && !/^[a-zA-Z0-9]{1,64}$/.test(proxyEmail.address))
      throw 'Bad address: only 1-64 alphanumerical characters allowed';

    const result = await db.query(
      `
        UPDATE proxy_emails
        SET name = ?, saveMail = ?
        WHERE id = ? AND userId = ?
      `,
      [proxyEmail.name, proxyEmail.saveMail, proxyEmail.id, userId]
    );
    if (!result.affectedRows) throw 'Could not update proxy email';

    // Remove links from proxy email and add new ones if needed
    await db.query('DELETE FROM links WHERE proxyEmailId = ?', [proxyEmail.id]);
    if (proxyEmail.links.length) {
      await db.query(
        `
          INSERT INTO links
            (proxyEmailId, orderIndex, primaryEmailId, modifierId, filterId)
            VALUES ${proxyEmail.links.map(l => `(?, ?, ?, ?, ?)`).join(', ')}
        `,
        proxyEmail.links
          .map(l => [
            proxyEmail.id,
            l.orderIndex,
            l.primaryEmailId,
            l.modifierId,
            l.filterId
          ])
          /** @todo remove @ts-ignore eventually */
          // @ts-ignore
          .flat()
      );
    }

    db.release();
    return await getProxyEmail(proxyEmail.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
