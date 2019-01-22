import { getMessage } from 'lib/messages/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editMessage(
  message: Ptorx.Message,
  userId: number
): Promise<Ptorx.Message> {
  const db = new MySQL();
  try {
    const result = await db.query(
      `
        UPDATE messages m SET
          m.subject = ?, m.from = ?, m.to = ?, m.text = ?, m.html = ?,
          m.headers = ?
        WHERE
          m.id = ? AND m.proxyEmailId = (
            SELECT pxe.id FROM proxy_emails pxe
            WHERE pxe.id = m.proxyEmailId AND pxe.userId = ?
          )
      `,
      [
        message.subject,
        message.from,
        message.to,
        message.text,
        message.html,
        JSON.stringify(message.headers),
        message.id,
        userId
      ]
    );
    if (!result.affectedRows) throw 'Could not edit message';

    await db.query('DELETE FROM message_attachments WHERE messageId = ?', [
      message.id
    ]);

    if (message.attachments.length)
      await db.query(
        `
          INSERT INTO message_attachments
            (messageId, filename, contentType, size, content)
            VALUES ${message.attachments.map(a => `(?, ?, ?, ?, ?)`).join(', ')}
        `,
        message.attachments
          .map(a => [message.id, a.filename, a.contentType, a.size, a.content])
          /** @todo remove @ts-ignore eventually */
          // @ts-ignore
          .flat()
      );

    return await getMessage(message.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
