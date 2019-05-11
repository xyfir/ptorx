import { addMessage } from 'lib/messages/add';
import { ParsedMail } from 'mailparser';
import * as openpgp from 'openpgp';
import { Ptorx } from 'types/ptorx';

export async function saveMail(
  raw: string,
  mail: ParsedMail,
  alias: Ptorx.Alias,
  user: Ptorx.User
): Promise<Ptorx.Message> {
  // Encrypt raw message
  if (user.publicKey) {
    const { keys } = await openpgp.key.readArmored(user.publicKey);
    const ciphertext = await openpgp.encrypt({
      message: openpgp.message.fromText(raw),
      publicKeys: keys
    });
    raw = ciphertext.data;
  }

  return await addMessage(
    {
      subject: mail.subject,
      aliasId: alias.id,
      from: mail.from.text,
      raw,
      to: mail.to.text
    },
    alias.userId
  );
}
