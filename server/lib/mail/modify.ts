import { SendMailOptions } from 'nodemailer';
import * as escapeRegExp from 'escape-string-regexp';
import { getModifier } from 'lib/modifiers/get';
import { Ptorx } from 'types/ptorx';

export async function modifyMail(
  mail: SendMailOptions,
  modifierId: Ptorx.Modifier['id'],
  userId: Ptorx.Modifier['userId']
): Promise<void> {
  const modifier = await getModifier(modifierId, userId);
  switch (modifier.type) {
    case 'text-only':
      delete mail.html;
      break;
    case 'replace':
      // Escape search if not regular expression
      modifier.find = !modifier.regex
        ? escapeRegExp(modifier.find)
        : modifier.replacement;
      // Escape '$' if not regular expression
      modifier.replacement = !modifier.regex
        ? modifier.replacement.replace(/\$/g, '$$')
        : modifier.replacement;
      // Replace text in body text and html
      mail.text = (mail.text as string).replace(
        new RegExp(modifier.find, modifier.flags),
        modifier.replacement
      );
      mail.html =
        mail.html &&
        (mail.html as string).replace(
          new RegExp(modifier.find, modifier.flags),
          modifier.replacement
        );
      break;
    case 'subject':
      mail.subject = modifier.subject;
      break;
    case 'tag':
      mail.subject = modifier.prepend
        ? modifier.tag + mail.subject
        : mail.subject + modifier.tag;
      break;
    case 'concat':
      mail[modifier.to] = modifier.prepend
        ? mail[modifier.add] + modifier.separator + mail[modifier.to]
        : mail[modifier.to] + modifier.separator + mail[modifier.add];
      break;
    case 'builder':
      mail[modifier.target] = modifier.template
        .replace(/{{html}}/g, typeof mail.html == 'string' ? mail.html : '')
        .replace(/{{text}}/g, mail.text as string)
        .replace(/{{from}}/g, mail.from as string)
        .replace(/{{subject}}/g, mail.subject)
        .replace(
          /{{header\('(.+)', '(.+)'\)}}/g,
          (m, p1: string, p2: string): string => {
            const headers = mail.headers as Array<{
              key: string;
              value: string;
            }>;
            const header = headers.find(h => h.key == p1);
            return header ? header.value : p2;
          }
        );
  }
}
