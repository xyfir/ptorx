import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listModifiers(
  userId: number
): Promise<Ptorx.ModifierList> {
  const db = new MySQL();
  try {
    const modifiers: Ptorx.ModifierList = await db.query(
      `
        SELECT
          id, userId, name, type, created,
          IF(userId = 0, 1, 0) AS global
        FROM modifiers
        WHERE userId = ? OR userId = 0
        ORDER BY created DESC
      `,
      [userId]
    );
    db.release();
    return modifiers.map(m => {
      m.global = !!m.global;
      return m;
    });
  } catch (err) {
    db.release();
    throw err;
  }
}
