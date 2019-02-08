import { MySQL } from 'lib/MySQL';
import { Ptorx } from 'types/ptorx';

export async function getFilter(
  filterId: Ptorx.Filter['id'],
  userId: number
): Promise<Ptorx.Filter> {
  const db = new MySQL();
  try {
    const [filter]: Ptorx.Filter[] = await db.query(
      'SELECT * FROM filters WHERE id = ? AND userId = ?',
      [filterId, userId]
    );
    if (!filter) throw 'Could not find filter';

    filter.regex = !!filter.regex;
    filter.blacklist = !!filter.blacklist;

    db.release();
    return filter;
  } catch (err) {
    db.release();
    throw err;
  }
}
