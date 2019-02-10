import { getProxyEmail } from 'lib/proxy-emails/get';
import { chargeUser } from 'lib/users/charge';
import { sendMail } from 'lib/mail/send';
import { Ptorx } from 'types/ptorx';

export async function sendMessage(
  data: {
    proxyEmailId: Ptorx.ProxyEmail['id'];
    subject: string;
    html: string;
    text: string;
    to: string;
  },
  userId: number
): Promise<void> {
  try {
    const proxyEmail = await getProxyEmail(data.proxyEmailId, userId);
    await sendMail(proxyEmail.domainId, {
      subject: data.subject,
      from: proxyEmail.fullAddress,
      html: data.html,
      text: data.text,
      to: data.to
    });
    await chargeUser(userId, 1);
  } catch (err) {
    throw err;
  }
}
