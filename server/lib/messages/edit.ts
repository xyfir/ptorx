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
        UPDATE messages m SET m.subject = ?, m.sender = ?, m.type = ?
        WHERE m.id = ? AND m.proxyEmailId = (
          SELECT pxe.proxyEmailId FROM proxy_emails pxe
          WHERE pxe.proxyEmailId = m.proxyEmailId AND pxe.userId = ?
        )
      `,
      [message.subject, message.sender, message.type, message.id, userId]
    );
    if (!result.affectedRows) throw 'Could not edit message';
    return await getMessage(message.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
