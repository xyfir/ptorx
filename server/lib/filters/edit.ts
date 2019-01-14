import { getFilter } from 'lib/filters/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editFilter(
  filter: Ptorx.Filter,
  userId: number
): Promise<Ptorx.Filter> {
  const db = new MySQL();
  try {
    if (!filter.type) throw 'Invalid type';
    else if (typeof filter.name != 'string') throw 'Missing name';
    else if (typeof filter.find != 'string') throw 'Missing "find"';
    else if (filter.type == 6 && filter.find.indexOf(':::') === -1)
      throw 'Bad header filter';

    const result = await db.query(
      `
        UPDATE filters SET
          name = ?, type = ?, find = ?, acceptOnMatch = ?, regex = ?
        WHERE filterId = ? AND userId = ?
      `,
      [
        filter.name,
        filter.type,
        filter.find,
        filter.acceptOnMatch,
        filter.regex,
        filter.filterId,
        filter.userId
      ]
    );
    if (!result.affectedRows) throw 'Could not update filter';

    db.release();
    return getFilter(filter.filterId, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
