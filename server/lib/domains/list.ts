import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listDomains(userId: number): Promise<Ptorx.DomainList> {
  const db = new MySQL();
  try {
    const domains = await db.query(
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
    return domains;
  } catch (err) {
    db.release();
    throw err;
  }
}
