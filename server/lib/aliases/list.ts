import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listAliases(userId: number): Promise<Ptorx.AliasList> {
  const db = new MySQL();
  try {
    const emails = await db.query(
      `
        SELECT
          a.id, a.name, a.created,
          CONCAT(a.address, '@', d.domain) AS fullAddress
        FROM aliases a
        LEFT JOIN domains d ON d.id = a.domainId
        WHERE a.userId = ?
        ORDER BY a.created DESC
      `,
      [userId]
    );
    db.release();
    return emails;
  } catch (err) {
    db.release();
    throw err;
  }
}
