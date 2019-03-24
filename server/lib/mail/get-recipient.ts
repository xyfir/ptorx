import { getMessage } from 'lib/messages/get';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';
import { SRS } from 'sender-rewriting-scheme';

const srs = new SRS({ secret: process.enve.SRS_KEY });

export async function getRecipient(address: string): Promise<Ptorx.Recipient> {
  const [local, domain] = address.split('@');
  const db = new MySQL();
  try {
    // Check if recipient is an SRS address we generated
    if (/^SRS/i.test(local)) {
      try {
        const reversed = srs.reverse(address);
        if (reversed === null) throw new Error('Not an SRS address');
        return { address, bounceTo: reversed };
      } catch (err) {
        throw new Error('Invalid SRS address');
      }
    }
    // Reply-To address
    else if (/--reply-x$/i.test(local)) {
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
    // Check if alias address
    else {
      const [row]: {
        aliasId: Ptorx.Alias['id'];
        domainId: Ptorx.Alias['domainId'];
        userId: Ptorx.Alias['userId'];
      }[] = await db.query(
        `
          SELECT a.id AS aliasId, a.userId, d.id AS domainId
          FROM domains d
          LEFT JOIN aliases a ON
            a.domainId = d.id AND a.address = ? AND
            a.userId IS NOT NULL
          WHERE
            d.domain = ? AND d.verified = ?
        `,
        [local, domain, true]
      );
      db.release();

      // Not a verified Ptorx domain
      if (!row) return { address };
      // Not an active alias on verified Ptorx domain
      if (!row.aliasId) throw new Error('User does not exist on domain');
      // Valid, active alias
      return {
        aliasId: row.aliasId,
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
