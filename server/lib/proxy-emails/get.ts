import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getProxyEmail(
  proxyEmailId: number,
  userId: number
): Promise<Ptorx.ProxyEmail> {
  const db = new MySQL();
  try {
    const [email]: Ptorx.ProxyEmail[] = await db.query(
      `
        SELECT
          pxe.*, CONCAT(pxe.address, '@', d.domain) AS fullAddress
        FROM
          proxy_emails AS pxe, primary_emails AS pme, domains AS d
        WHERE
          pxe.proxyEmailId = ? AND pxe.userId = ? AND
          pme.primaryEmailId = pxe.primaryEmailId AND
          d.id = pxe.domainId
      `,
      [proxyEmailId, userId]
    );
    if (!email) throw 'Could not find email';

    email.links = await db.query(
      `
        SELECT orderIndex, primaryEmailId, modifierId, filterId
        FROM links
        WHERE proxyEmailId = ?
      `,
      [proxyEmailId]
    );
    email.saveMail = !!email.saveMail;
    email.spamFilter = !!email.spamFilter;
    email.directForward = !!email.directForward;

    db.release();
    return email;
  } catch (err) {
    db.release();
    throw err;
  }
}
