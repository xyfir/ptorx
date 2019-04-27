import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listPrimaryEmails(
  userId: number
): Promise<Ptorx.PrimaryEmailList> {
  const db = new MySQL();
  try {
    const primaryEmails: Ptorx.PrimaryEmailList = await db.query(
      `
        SELECT id, userId, address, created, verified, autolink
        FROM primary_emails WHERE userId = ?
      `,
      [userId]
    );
    db.release();
    return primaryEmails.map(e => {
      e.verified = !!e.verified;
      e.autolink = !!e.autolink;
      return e;
    });
  } catch (err) {
    db.release();
    throw err;
  }
}
