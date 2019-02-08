import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getModifier(
  modifierId: Ptorx.Modifier['id'],
  userId: number
): Promise<Ptorx.Modifier> {
  const db = new MySQL();
  try {
    const [modifier] = await db.query(
      'SELECT * FROM modifiers WHERE id = ? AND userId = ?',
      [modifierId, userId]
    );
    if (!modifier) throw 'Could not find modifier';
    db.release();
    modifier.regex =
      typeof modifier.regex == 'number' ? !!modifier.regex : null;
    modifier.prepend =
      typeof modifier.prepend == 'number' ? !!modifier.prepend : null;
    return modifier;
  } catch (err) {
    db.release();
    throw err;
  }
}
