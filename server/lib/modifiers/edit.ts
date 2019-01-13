import { getModifier } from 'lib/modifiers/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editModifier(
  modifier: Ptorx.Modifier,
  userId: number
): Promise<Ptorx.Modifier> {
  const db = new MySQL();
  try {
    // ** validate
    const result = await db.query(
      `
        UPDATE modifiers
        SET
          name = ?, description = ?, type = ?, value = ?, subject = ?, with = ?,
          flags = ?, regex = ?, prepend = ?, target = ?
        WHERE modifierId = ? AND userId = ?
      `,
      [
        modifier.name,
        modifier.description,
        modifier.type,
        modifier.value,
        modifier.subject,
        modifier.with,
        modifier.flags,
        modifier.regex,
        modifier.prepend,
        modifier.target,
        modifier.modifierId,
        userId
      ]
    );
    if (!result.affectedRows) throw 'Could not edit modifier';

    db.release();
    return await getModifier(modifier.modifierId, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
