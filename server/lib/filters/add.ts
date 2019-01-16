import { editFilter } from 'lib/filters/edit';
import { getFilter } from 'lib/filters/get';
import * as moment from 'moment';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function addFilter(
  filter: Partial<Ptorx.Filter>,
  userId: number
): Promise<Ptorx.Filter> {
  const db = new MySQL();
  try {
    const insert: Partial<Ptorx.Filter> = {
      type: 1,
      userId,
      created: moment().unix()
    };
    const result = await db.query('INSERT INTO filters SET ?', insert);
    if (!result.affectedRows) throw 'Could not create filter';
    db.release();
    const _filter = await getFilter(result.insertId, userId);
    return await editFilter({ ..._filter, ...filter }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
