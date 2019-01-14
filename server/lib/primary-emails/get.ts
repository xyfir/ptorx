import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getPrimaryEmail(
  primaryEmailId: Ptorx.PrimaryEmail['primaryEmailId'],
  userId: number
): Promise<Ptorx.PrimaryEmail> {
  const db = new MySQL();
  try {
    const [primaryEmail] = await db.query(
      `
        SELECT primaryEmailId, userId, address, created
        FROM primary_emails WHERE primaryEmailId = ? AND userId = ?
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
