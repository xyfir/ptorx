import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deletePrimaryEmail(
  primaryEmailId: Ptorx.PrimaryEmail['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    await db.query('DELETE FROM primary_emails WHERE id = ? AND userId = ?', [
      primaryEmailId,
      userId
    ]);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
