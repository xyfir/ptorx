import { sendMessage } from 'lib/messages/send';
import { getMessage } from 'lib/messages/get';
import { Ptorx } from 'typings/ptorx';

export async function replyToMessage(
  messageId: Ptorx.Message['id'],
  content: string,
  userId: number
): Promise<void> {
  try {
    const message = await getMessage(messageId, userId);
    await sendMessage(
      {
        proxyEmailId: message.proxyEmailId,
        subject: message.subject,
        content,
        to: message.from
      },
      userId
    );
  } catch (err) {
    throw err;
  }
}
