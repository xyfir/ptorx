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

export async function getMessageAttachmentBin(
  messageAttachmentId: Ptorx.Message['attachments'][0]['id'],
  userId: number
): Promise<Buffer> {
  const db = new MySQL();
  try {
    const [row] = await db.query(
      `
        SELECT ma.content
        FROM message_attachments ma
        LEFT JOIN messages m ON m.id = ma.messageId
        LEFT JOIN proxy_emails pxe ON pxe.id = m.proxyEmailId
        WHERE ma.id = ? AND pxe.userId = ?
      `,
      [messageAttachmentId, userId]
    );
    return row.content;
  } catch (err) {
    db.release();
    throw err;
  }
}
