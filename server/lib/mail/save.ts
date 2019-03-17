import { addMessage } from 'lib/messages/add';
import { ParsedMail } from 'mailparser';
import * as openpgp from 'openpgp';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';

export async function saveMail(
  original: ParsedMail,
  alias: Ptorx.Alias
): Promise<Ptorx.Message> {
  const user = await getUser(alias.userId);

  let html = typeof original.html == 'string' ? original.html : undefined;
  let text = original.text;

  // Encrypt email body
  if (user.publicKey) {
    const { keys } = await openpgp.key.readArmored(user.publicKey);
    let ciphertext = await openpgp.encrypt({
      message: openpgp.message.fromText(text),
      publicKeys: keys
    });
    text = ciphertext.data;

    if (html !== undefined) {
      ciphertext = await openpgp.encrypt({
        message: openpgp.message.fromText(html),
        publicKeys: keys
      });
      html = ciphertext.data;
    }
  }

  return await addMessage(
    {
      attachments: original.attachments.map(a => ({
        filename: a.filename,
        contentType: a.contentType,
        content: a.content,
        size: a.content.byteLength
      })),
      from: original.from.text,
      headers: original.headerLines.map(h => h.line),
      html,
      aliasId: alias.id,
      subject: original.subject,
      text,
      to: original.to.text
    },
    alias.userId
  );
}
