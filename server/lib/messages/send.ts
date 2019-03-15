import { getAlias } from 'lib/aliases/get';
import { chargeCredits } from 'lib/users/charge';
import { sendMail } from 'lib/mail/send';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';

export async function sendMessage(
  data: {
    aliasId: Ptorx.Alias['id'];
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
    if (user.tier == 'basic') throw 'Basic tier users cannot send mail';

    const alias = await getAlias(data.aliasId, userId);
    await sendMail(
      {
        subject: data.subject,
        from: alias.fullAddress,
        html: data.html,
        text: data.text,
        to: data.to
      },
      alias.domainId
    );

    await chargeCredits(user, 1);
  } catch (err) {
    throw err;
  }
}
