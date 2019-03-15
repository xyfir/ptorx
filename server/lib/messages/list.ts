import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function listMessages(userId: number): Promise<Ptorx.MessageList> {
  const db = new MySQL();
  try {
    const messages = await db.query(
      `
        SELECT m.id, m.aliasId, m.created, m.subject, m.from
        FROM messages m WHERE m.aliasId IN (
          SELECT id FROM aliases WHERE userId = ?
        )
        ORDER BY created DESC
      `,
      [userId]
    );
    db.release();
    return messages;
  } catch (err) {
    db.release();
    throw err;
  }
}
