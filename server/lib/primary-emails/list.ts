import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listPrimaryEmails(
  userId: number
): Promise<Ptorx.PrimaryEmailList> {
  const db = new MySQL();
  try {
    const primaryEmails = await db.query(
      `
        SELECT primaryEmailId, userId, address, created
        FROM primary_emails WHERE userId = ?
      `,
      [userId]
    );
    db.release();
    return primaryEmails;
  } catch (err) {
    db.release();
    throw err;
  }
}
