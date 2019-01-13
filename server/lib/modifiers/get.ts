import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getModifier(
  modifierId: number,
  userId: number
): Promise<Ptorx.Modifier> {
  const db = new MySQL();
  try {
    const [modifier] = await db.query(
      'SELECT * FROM modifiers WHERE modifierId = ? AND userId = ?',
      [modifierId, userId]
    );
    if (!modifier) throw 'Could not find modifier';
    db.release();
    modifier.regex =
      typeof modifier.regex == 'number' ? !!modifier.regex : null;
    modifier.prepend =
      typeof modifier.prepend == 'number' ? !!modifier.prepend : null;
    modifier.target =
      typeof modifier.target == 'number' ? !!modifier.target : null;
    return modifier;
  } catch (err) {
    db.release();
    throw err;
  }
}
