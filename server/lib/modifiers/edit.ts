import { getModifier } from 'lib/modifiers/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editModifier(
  modifier: Ptorx.Modifier,
  userId: number
): Promise<Ptorx.Modifier> {
  const db = new MySQL();
  try {
    const result = await db.query(
      `
        UPDATE modifiers m
        SET m.name = ?, m.target = ?, m.template = ?
        WHERE m.id = ? AND m.userId = ?
      `,
      [modifier.name, modifier.target, modifier.template, modifier.id, userId]
    );
    if (!result.affectedRows) throw 'Could not edit modifier';

    db.release();
    return await getModifier(modifier.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
