import { getProxyEmail } from 'lib/proxy-emails/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editProxyEmail(
  proxyEmail: Ptorx.ProxyEmail,
  userId: number
): Promise<Ptorx.ProxyEmail> {
  const db = new MySQL();
  try {
    if (typeof proxyEmail.name != 'string') throw 'Missing name';
    if (proxyEmail.address && !/^[a-zA-Z0-9]{1,64}$/.test(proxyEmail.address))
      throw 'Bad address: only 1-64 alphanumerical characters allowed';

    const result = await db.query(
      `
        UPDATE proxy_emails
        SET name = ?, saveMail = ?, directForward = ?, spamFilter = ?
        WHERE proxyEmailId = ? AND userId = ?
      `,
      [
        proxyEmail.name,
        proxyEmail.saveMail,
        proxyEmail.directForward,
        proxyEmail.spamFilter,
        proxyEmail.proxyEmailId,
        userId
      ]
    );
    if (!result.affectedRows) throw 'Could not update proxy email';

    // Remove links from proxy email and add new ones if needed
    await db.query('DELETE FROM links WHERE proxyEmailId = ?', [
      proxyEmail.proxyEmailId
    ]);
    if (proxyEmail.links.length) {
      await db.query(
        `
          INSERT INTO links
            (proxyEmailId, orderIndex, primaryEmailId, modifierId, filterId)
            VALUES ${proxyEmail.links.map(l => `(?, ?, ?, ?, ?)`).join(', ')}
        `,
        proxyEmail.links
          .map(l => [
            proxyEmail.proxyEmailId,
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
    return await getProxyEmail(proxyEmail.proxyEmailId, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
