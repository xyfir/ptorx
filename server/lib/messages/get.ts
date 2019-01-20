import { MySQL } from 'lib/MySQL';
import { Ptorx } from 'typings/ptorx';

export async function getMessage(
  messageId: Ptorx.Message['id'],
  userId: number
): Promise<Ptorx.Message> {
  const db = new MySQL();
  try {
    const [message] = await db.query(
      `
        SELECT m.* FROM messages m
        INNER JOIN proxy_emails pxe ON m.proxyEmailId = pxe.id
        WHERE m.id = ? AND pxe.userId = ?
      `,
      [messageId, userId]
    );
    if (!message) throw 'Could not find message';

    message.headers = JSON.parse(message.headers || '[]');
    message.attachments = await db.query(
      `
        SELECT id, filename, contentType, size
        FROM message_attachments WHERE messageId = ?
      `,
      [messageId]
    );

    db.release();
    return message;
  } catch (err) {
    db.release();
    throw err;
  }
}
