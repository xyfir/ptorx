import { addMessage } from 'lib/messages/add';
import { ParsedMail } from 'mailparser';
import { Ptorx } from 'types/ptorx';

export async function saveMail(
  original: ParsedMail,
  alias: Ptorx.Alias
): Promise<Ptorx.Message> {
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
      html: typeof original.html == 'string' ? original.html : undefined,
      aliasId: alias.id,
      subject: original.subject,
      text: original.text,
      to: original.to.text
    },
    alias.userId
  );
}
