import { getDomain } from 'lib/domains/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editDomain(
  domain: Ptorx.Domain,
  userId: number
): Promise<Ptorx.Domain> {
  const db = new MySQL();
  try {
    const result = await db.query(
      `
        UPDATE domains SET domainKey = ?, verified = ?, global = ?
        WHERE id = ? AND userId = ?
      `,
      [
        domain.domainKey,
        domain.verified,
        domain.global,
        domain.id,
        domain.userId
      ]
    );
    if (!result.affectedRows) throw 'Could not update domain';

    db.release();
    return getDomain(domain.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
