import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listDomainUsers(
  domainId: Ptorx.Domain['id'],
  userId: number
): Promise<Ptorx.DomainUserList> {
  const db = new MySQL();
  try {
    const domains: Ptorx.DomainUserList = await db.query(
      `
        SELECT label, domainId, requestKey, created, authorized
        FROM domain_users
        WHERE
          domainId IN (SELECT id FROM domains WHERE id = ? AND userId = ?) AND
          userId != ?
        ORDER BY created DESC
      `,
      [domainId, userId, userId]
    );
    db.release();
    return domains.map(d => {
      d.authorized = !!d.authorized;
      return d;
    });
  } catch (err) {
    db.release();
    throw err;
  }
}
