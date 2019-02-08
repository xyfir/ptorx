import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteModifier(
  modifierId: Ptorx.Modifier['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    await db.query(`DELETE FROM modifiers WHERE id = ? AND userId = ?`, [
      modifierId,
      userId
    ]);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
