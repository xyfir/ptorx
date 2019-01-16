import { MySQL } from 'lib/MySQL';
import { Ptorx } from 'typings/ptorx';

export async function getMessage(
  messageId: Ptorx.Message['id'],
  userId: number
): Promise<Ptorx.Message> {
  const db = new MySQL();
  try {
    const [message]: Ptorx.Message[] = await db.query(
      `
        SELECT m.* FROM messages m
        INNER JOIN proxy_emails pxe ON m.proxyEmailId = pxe.id
        WHERE m.id = ? AND pxe.userId = ?
      `,
      [messageId, userId]
    );
    if (!message) throw 'Could not find message';
    db.release();
    return message;
  } catch (err) {
    db.release();
    throw err;
  }
}