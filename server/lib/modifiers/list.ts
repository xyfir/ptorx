import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listModifiers(
  userId: number
): Promise<Ptorx.ModifierList> {
  const db = new MySQL();
  try {
    const modifiers: Ptorx.ModifierList = await db.query(
      `
        SELECT id, userId, name, created
        FROM modifiers
        WHERE userId = ? OR userId = 0
        ORDER BY created DESC
      `,
      [userId]
    );
    db.release();
    return modifiers;
  } catch (err) {
    db.release();
    throw err;
  }
}
