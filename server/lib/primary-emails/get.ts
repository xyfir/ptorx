import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getPrimaryEmail(
  primaryEmailId: Ptorx.PrimaryEmail['id'],
  userId: number
): Promise<Ptorx.PrimaryEmail> {
  const db = new MySQL();
  try {
    const [primaryEmail] = await db.query(
      `
        SELECT id, userId, address, created
        FROM primary_emails WHERE id = ? AND userId = ?
      `,
      [primaryEmailId, userId]
    );
    db.release();
    return primaryEmail;
  } catch (err) {
    db.release();
    throw err;
  }
}
