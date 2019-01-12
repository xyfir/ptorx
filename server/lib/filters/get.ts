import { MySQL } from 'lib/MySQL';
import { Ptorx } from 'typings/ptorx';

export async function getFilter(
  filterId: number,
  userId: number
): Promise<Ptorx.Filter> {
  const db = new MySQL();
  try {
    const [filter]: Ptorx.Filter[] = await db.query(
      'SELECT * FROM filters WHERE filterId = ? AND userId = ?',
      [filterId, userId]
    );
    if (!filter) throw 'Could not find filter';

    filter.regex = !!filter.regex;
    filter.acceptOnMatch = !!filter.acceptOnMatch;

    db.release();
    return filter;
  } catch (err) {
    db.release();
    throw err;
  }
}
