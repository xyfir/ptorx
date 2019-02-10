import { sendMessage } from 'lib/messages/send';
import { getMessage } from 'lib/messages/get';
import { Ptorx } from 'types/ptorx';

export async function replyToMessage(
  data: {
    messageId: Ptorx.Message['id'];
    html: string;
    text: string;
  },
  userId: number
): Promise<void> {
  try {
    const message = await getMessage(data.messageId, userId);
    await sendMessage(
      {
        proxyEmailId: message.proxyEmailId,
        subject: message.subject,
        html: data.html,
        text: data.text,
        to: message.replyTo || message.from
      },
      userId
    );
  } catch (err) {
    throw err;
  }
}
