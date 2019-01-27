import { getProxyEmail } from 'lib/proxy-emails/get';
import { chargeUser } from 'lib/users/charge';
import { sendMail } from 'lib/mail/send';
import { Ptorx } from 'typings/ptorx';

export async function sendMessage(
  data: {
    proxyEmailId: Ptorx.ProxyEmail['id'];
    content: string;
    subject: string;
    to: string;
  },
  userId: number
): Promise<void> {
  try {
    const proxyEmail = await getProxyEmail(data.proxyEmailId, userId);
    await sendMail(proxyEmail.domainId, {
      subject: data.subject,
      from: proxyEmail.fullAddress,
      text: data.content,
      to: data.to
    });
    await chargeUser(userId, 1);
  } catch (err) {
    throw err;
  }
}
