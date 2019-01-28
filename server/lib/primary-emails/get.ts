import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getPrimaryEmail(
  primaryEmailId: Ptorx.PrimaryEmail['id'],
  userId: number
): Promise<Ptorx.PrimaryEmail> {
  const db = new MySQL();
  try {
    const [primaryEmail]: Ptorx.PrimaryEmail[] = await db.query(
      'SELECT * FROM primary_emails WHERE id = ? AND userId = ?',
      [primaryEmailId, userId]
    );
    db.release();
    primaryEmail.verified = !!primaryEmail.verified;
    return primaryEmail;
  } catch (err) {
    db.release();
    throw err;
  }
}
