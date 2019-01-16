import { getMessage } from 'lib/messages/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteMessage(
  messageId: Ptorx.Message['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    await getMessage(messageId, userId);
    await db.query('DELETE FROM messages WHERE id = ?', [messageId, userId]);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
