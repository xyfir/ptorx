import { getProxyEmail } from 'lib/proxy-emails/get';
import { chargeUser } from 'lib/users/charge';
import { getDomain } from 'lib/domains/get';
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
    const domain = await getDomain(proxyEmail.domainId, userId);
    await sendMail(domain.id, {
      subject: data.subject,
      from: `${proxyEmail.address}@${domain.domain}`,
      text: data.content,
      to: data.to
    });
    await chargeUser(userId, 1);
  } catch (err) {
    throw err;
  }
}
