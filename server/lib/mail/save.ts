import { addMessage } from 'lib/messages/add';
import { ParsedMail } from 'mailparser';
import * as openpgp from 'openpgp';
import { Ptorx } from 'types/ptorx';

export async function saveMail(
  mail: ParsedMail,
  alias: Ptorx.Alias,
  user: Ptorx.User
): Promise<Ptorx.Message> {
  let html = typeof mail.html == 'string' ? mail.html : undefined;
  let text = mail.text;

  // Encrypt email body
  if (user.publicKey) {
    const { keys } = await openpgp.key.readArmored(user.publicKey);
    let ciphertext = await openpgp.encrypt({
      message: openpgp.message.fromText(text),
      publicKeys: keys
    });
    text = ciphertext.data as string;

    if (html !== undefined) {
      ciphertext = await openpgp.encrypt({
        message: openpgp.message.fromText(html),
        publicKeys: keys
      });
      html = ciphertext.data as string;
    }
  }

  return await addMessage(
    {
      attachments: mail.attachments.map(a => ({
        filename: a.filename,
        contentType: a.contentType,
        content: a.content,
        size: a.content.byteLength
      })),
      from: mail.from.text,
      headers: mail.headerLines.map(h => h.line),
      html,
      aliasId: alias.id,
      subject: mail.subject,
      text,
      to: mail.to.text
    },
    alias.userId
  );
}
