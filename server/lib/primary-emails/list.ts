import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listPrimaryEmails(
  userId: number
): Promise<Ptorx.PrimaryEmailList> {
  const db = new MySQL();
  try {
    const primaryEmails: Ptorx.PrimaryEmailList = await db.query(
      `
        SELECT id, userId, address, created, verified
        FROM primary_emails WHERE userId = ?
      `,
      [userId]
    );
    db.release();
    return primaryEmails.map(e => {
      e.verified = !!e.verified;
      return e;
    });
  } catch (err) {
    db.release();
    throw err;
  }
}
