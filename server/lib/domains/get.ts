import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getDomain(
  domainId: number,
  userId: number
): Promise<Ptorx.Domain> {
  const db = new MySQL();

  try {
    const [domain]: Ptorx.Domain[] = await db.query(
      'SELECT * FROM domains WHERE id = ?',
      [domainId]
    );
    if (!domain) throw 'Could not find domain';

    domain.isCreator = domain.userId == userId;

    if (!domain.isCreator) {
      db.release();
      return domain;
    }

    if (domain.domainKey) domain.domainKey = JSON.parse(domain.domainKey);

    domain.users = await db.query(
      `
        SELECT userId AS id, label, requestKey AS requestKey, created
        FROM domain_users
        WHERE domainId = ? AND userId != ? AND authorized = 1
        ORDER BY created ASC
      `,
      [domain.id, userId]
    );

    db.release();
    return domain;
  } catch (err) {
    db.release();
    throw err;
  }
}
