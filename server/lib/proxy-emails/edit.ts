import { getProxyEmail } from 'lib/proxy-emails/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editProxyEmail(
  proxyEmail: Ptorx.ProxyEmail,
  userId: number
): Promise<Ptorx.ProxyEmail> {
  const db = new MySQL();
  try {
    if (proxyEmail.canReply && !proxyEmail.saveMail)
      throw 'You cannot reply to mail unless it is saved to Ptorx';
    if (proxyEmail.name.indexOf('"') > -1)
      throw 'Name cannot contain "double quotes"';

    const result = await db.query(
      `
        UPDATE proxy_emails
        SET name = ?, saveMail = ?, canReply = ?
        WHERE id = ? AND userId = ?
      `,
      [
        proxyEmail.name,
        proxyEmail.saveMail,
        proxyEmail.canReply,
        proxyEmail.id,
        userId
      ]
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
