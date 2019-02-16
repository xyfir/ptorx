import { getProxyEmail } from 'lib/proxy-emails/get';
import { chargeCredits } from 'lib/users/charge';
import { sendMail } from 'lib/mail/send';
import { getUser } from 'lib/users/get';
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
    const user = await getUser(userId);
    if (user.credits < 1) throw 'You need at least one credit to send mail';

    const proxyEmail = await getProxyEmail(data.proxyEmailId, userId);
    await sendMail(proxyEmail.domainId, {
      subject: data.subject,
      from: proxyEmail.fullAddress,
      html: data.html,
      text: data.text,
      to: data.to
    });

    await chargeCredits(userId, 1);
  } catch (err) {
    throw err;
  }
}
