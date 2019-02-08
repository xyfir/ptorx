import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteFilter(
  filterId: Ptorx.Filter['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    const result = await db.query(
      'DELETE FROM filters WHERE id = ? AND userId = ?',
      [filterId, userId]
    );
    if (!result.affectedRows) throw 'Could not delete filter';
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
