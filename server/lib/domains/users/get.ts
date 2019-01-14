import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getDomainUser(
  domainId: Ptorx.Domain['id'],
  domainUserKey: Ptorx.DomainUser['requestKey'],
  /** User id of domain owner */
  userId: number
): Promise<Ptorx.DomainUser> {
  const db = new MySQL();
  try {
    const [domain]: Ptorx.DomainUser[] = await db.query(
      `
        SELECT * FROM domain_users WHERE requestKey = ? AND domainId IN (
          SELECT id FROM domains WHERE id = ? AND userId = ?
        )
      `,
      [domainUserKey, domainId, userId]
    );
    db.release();
    domain.authorized = !!domain.authorized;
    return domain;
  } catch (err) {
    db.release();
    throw err;
  }
}
