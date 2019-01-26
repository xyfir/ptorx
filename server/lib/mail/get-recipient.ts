import { getMessage } from 'lib/messages/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getRecipient(address: string): Promise<Ptorx.Recipient> {
  const [user, domain] = address.split('@');
  const db = new MySQL();
  try {
    // Reply-To address
    if (user.endsWith('--reply')) {
      try {
        const [userId, messageId, messageKey] = user.split('--');
        const message = await getMessage(+messageId, +userId);
        if (message.key != messageKey) throw new Error('Message key mismatch');
        return { address, message, userId: +userId };
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
        [user, domain, true]
      );
      db.release();

      // Not a verified Ptorx domain
      if (!row) return { address };
      // Not an active proxy email on verified Ptorx domain
      if (!row.proxyEmailId) throw new Error('User does not exist on domain');
      // Valid, active proxy email
      return { ...row, address };
    }
  } catch (err) {
    db.release();
    return { address };
  }
}
