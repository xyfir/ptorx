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
    const result = await db.query('INSERT INTO filters SET ?', {
      type: 1,
      userId,
      created: moment().unix()
    });
    if (!result.affectedRows) throw 'Could not create filter';
    db.release();
    const _filter = await getFilter(filter.filterId, userId);
    return await editFilter({ ...filter, ..._filter }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
