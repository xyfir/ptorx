import { getMessage } from 'lib/messages/get';
import { chargeUser } from 'lib/users/charge';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

/**
 * @todo Actually reply to message
 */
export async function replyToMessage(
  messageId: Ptorx.Message['id'],
  content: string,
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    const message = await getMessage(messageId, userId);
    await chargeUser(userId, 1);
  } catch (err) {
    db.release();
    throw err;
  }
}
