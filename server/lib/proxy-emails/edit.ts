import { getProxyEmail } from 'lib/proxy-emails/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editProxyEmail(
  proxyEmail: Ptorx.ProxyEmail,
  userId: number
): Promise<Ptorx.ProxyEmail> {
  const db = new MySQL();
  try {
    if (proxyEmail.address) {
      if (!/^[\w\-]{1,64}$/.test(proxyEmail.address))
        throw 'Bad address: must 1-64 alphanumerical characters';
      if (proxyEmail.address.startsWith('x-'))
        throw 'Bad address: cannot start with "x-"';
      if (proxyEmail.address.endsWith('-x'))
        throw 'Bad address: cannot end with "-x"';
      if (proxyEmail.address.indexOf('--') > -1)
        throw 'Bad address: cannot contain two or more consecutive hyphens';
      if (proxyEmail.address.indexOf('__') > -1)
        throw 'Bad address: cannot contain two or more consecutive underscores';
    }

    if (proxyEmail.canReply && !proxyEmail.saveMail)
      throw 'You cannot reply to mail unless it is saved to Ptorx';

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
