import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteMessage(
  messageId: Ptorx.Message['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    await db.query(
      `
        DELETE FROM messages m
        WHERE m.id = ? AND m.proxyEmailId = (
          SELECT proxyEmailId FROM proxy_emails pxe
          WHERE m.proxyEmailId = pxe.proxyEmailId AND pxe.userId = ?
        )
      `,
      [messageId, userId]
    );
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
