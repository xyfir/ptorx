import { MySQL } from 'lib/MySQL';
import { Ptorx } from 'types/ptorx';

export async function getMessage(
  messageId: Ptorx.Message['id'],
  /** User id of message owner or the message's key */
  authentication: number | Ptorx.Message['key']
): Promise<Ptorx.Message> {
  const db = new MySQL();
  try {
    const [message] = await db.query(
      `
        SELECT
          m.*, pxe.userId,
          CONCAT(m.id, '--', m.key, '--reply-x@', d.domain) AS ptorxReplyTo
        FROM messages m
        INNER JOIN proxy_emails pxe ON m.proxyEmailId = pxe.id
        INNER JOIN domains d ON d.id = pxe.domainId
        WHERE m.id = ? AND ${
          typeof authentication == 'number' ? 'pxe.userId' : 'm.key'
        } = ?
      `,
      [messageId, authentication]
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
