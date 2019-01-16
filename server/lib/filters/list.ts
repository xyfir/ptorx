import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listFilters(userId: number): Promise<Ptorx.FilterList> {
  const db = new MySQL();
  try {
    const filters = await db.query(
      `
        SELECT id, name, type, created
        FROM filters WHERE userId = ?
        ORDER BY created DESC
      `,
      [userId]
    );
    db.release();
    return filters;
  } catch (err) {
    db.release();
    throw err;
  }
}
