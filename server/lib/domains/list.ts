import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listDomains(userId: number): Promise<Ptorx.DomainList> {
  const db = new MySQL();
  try {
    const domains: Ptorx.DomainList = await db.query(
      `
        SELECT
          id, domain, userId = ? AS isCreator, global, created
        FROM domains
        WHERE
          global = 1 OR id IN (
            SELECT domainId FROM domain_users
            WHERE userId = ? AND authorized = 1
          )
        ORDER BY created DESC
      `,
      [userId, userId]
    );
    db.release();
    return domains.map(d => {
      d.isCreator = !!d.isCreator;
      d.global = !!d.global;
      return d;
    });
  } catch (err) {
    db.release();
    throw err;
  }
}
