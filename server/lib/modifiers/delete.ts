import { MySQL } from 'lib/MySQL';

export async function deleteModifier(
  modifierId: number,
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    await db.query(
      `DELETE FROM modifiers WHERE modifierId = ? AND userId = ?`,
      [modifierId, userId]
    );
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
