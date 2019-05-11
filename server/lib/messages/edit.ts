import { getMessage } from 'lib/messages/get';
import { Ptorx } from 'types/ptorx';
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
          m.subject = ?, m.from = ?, m.to = ?, m.raw = ?, m.replyTo = ?
        WHERE
          m.id = ? AND m.aliasId = (
            SELECT a.id FROM aliases a
            WHERE a.id = m.aliasId AND a.userId = ?
          )
      `,
      [
        message.subject,
        message.from,
        message.to,
        message.raw,
        message.replyTo,
        message.id,
        userId
      ]
    );
    if (!result.affectedRows) throw 'Could not edit message';

    return await getMessage(message.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
