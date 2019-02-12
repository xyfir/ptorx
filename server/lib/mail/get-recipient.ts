import { getMessage } from 'lib/messages/get';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getRecipient(address: string): Promise<Ptorx.Recipient> {
  const [local, domain] = address.split('@');
  const db = new MySQL();
  try {
    // Reply-To address
    if (local.endsWith('--reply-x')) {
      try {
        const [messageId, messageKey] = local.split('--');
        const message = await getMessage(+messageId, messageKey);
        const user = await getUser(message.userId);
        return { address, message, user };
      } catch (err) {
        // ** Send email response explaining problem
        throw new Error('Bad message reply address');
      }
    }
    // Check if proxy address
    else {
      const [row]: {
        proxyEmailId: Ptorx.ProxyEmail['id'];
        domainId: Ptorx.ProxyEmail['domainId'];
        userId: Ptorx.ProxyEmail['userId'];
      }[] = await db.query(
        `
          SELECT pxe.id AS proxyEmailId, pxe.userId, d.id AS domainId
          FROM domains d
          LEFT JOIN proxy_emails pxe ON
            pxe.domainId = d.id AND pxe.address = ? AND
            pxe.userId IS NOT NULL
          WHERE
            d.domain = ? AND d.verified = ?
        `,
        [local, domain, true]
      );
      db.release();

      // Not a verified Ptorx domain
      if (!row) return { address };
      // Not an active proxy email on verified Ptorx domain
      if (!row.proxyEmailId) throw new Error('User does not exist on domain');
      // Valid, active proxy email
      return {
        proxyEmailId: row.proxyEmailId,
        domainId: row.domainId,
        address,
        user: await getUser(row.userId)
      };
    }
  } catch (err) {
    db.release();
    return { address };
  }
}
