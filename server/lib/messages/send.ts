import { getProxyEmail } from 'lib/proxy-emails/get';
import { chargeUser } from 'lib/users/charge';
import { Ptorx } from 'typings/ptorx';

/**
 * @todo Actually send email
 */
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
    await chargeUser(userId, 1);
  } catch (err) {
    throw err;
  }
}
