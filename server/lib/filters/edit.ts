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
    else if (filter.type == 'header' && filter.find.indexOf(':') === -1)
      throw 'Bad header filter';

    const result = await db.query(
      `
        UPDATE filters SET
          name = ?, type = ?, find = ?, blacklist = ?, regex = ?
        WHERE id = ? AND userId = ?
      `,
      [
        filter.name,
        filter.type,
        filter.find,
        filter.blacklist,
        filter.regex,
        filter.id,
        filter.userId
      ]
    );
    if (!result.affectedRows) throw 'Could not update filter';

    db.release();
    return getFilter(filter.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
