import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteDomain(
  domainId: Ptorx.Domain['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    await db.query('DELETE FROM domains WHERE id = ? AND userId = ?', [
      domainId,
      userId
    ]);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
