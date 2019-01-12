import { MySQL } from 'lib/MySQL';

export async function getModifier(
  modifierId: number,
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    const [modifier] = await db.query(
      'SELECT * FROM modifiers WHERE modifierId = ? AND userId = ?',
      [modifierId, userId]
    );
    if (!modifier) throw 'Could not find modifier';
    db.release();
    return modifier;
  } catch (err) {
    db.release();
    throw err;
  }
}
