import { editModifier } from 'lib/modifiers/edit';
import { getModifier } from 'lib/modifiers/get';
import * as moment from 'moment';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function addModifier(
  modifier: Partial<Ptorx.Modifier>,
  userId: number
): Promise<Ptorx.Modifier> {
  const db = new MySQL();
  try {
    const insert: Partial<Ptorx.Modifier> = {
      userId,
      created: moment().unix()
    };
    const result = await db.query('INSERT INTO modifiers SET ?', insert);
    if (!result.affectedRows) throw 'Could not add modifier';

    const _modifier = await getModifier(result.insertId, userId);
    db.release();
    return editModifier({ ..._modifier, ...modifier }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
