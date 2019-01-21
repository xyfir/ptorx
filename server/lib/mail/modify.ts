import { SendMailOptions } from 'nodemailer';
import * as escapeRegExp from 'escape-string-regexp';
import { getModifier } from 'lib/modifiers/get';
import { Ptorx } from 'typings/ptorx';

export async function modifyMail(
  modified: SendMailOptions,
  modifierId: Ptorx.Modifier['id'],
  userId: Ptorx.Modifier['userId']
): Promise<void> {
  const modifier = await getModifier(modifierId, userId);
  switch (modifier.type) {
    case 'text-only':
      delete modified.html;
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
      modified.text = (modified.text as string).replace(
        new RegExp(modifier.find, modifier.flags),
        modifier.replacement
      );
      modified.html =
        modified.html &&
        (modified.html as string).replace(
          new RegExp(modifier.find, modifier.flags),
          modifier.replacement
        );
      break;
    case 'subject':
      modified.subject = modifier.subject;
      break;
    case 'tag':
      modified.subject = modifier.prepend
        ? modifier.tag + modified.subject
        : modified.subject + modifier.tag;
      break;
    case 'concat':
      modified[modifier.to] = modifier.prepend
        ? modified[modifier.add] + modifier.separator + modified[modifier.to]
        : modified[modifier.to] + modifier.separator + modified[modifier.add];
      break;
    case 'builder':
      modified[modifier.target] = modifier.template
        .replace(
          /{{html}}/g,
          typeof modified.html == 'string' ? modified.html : ''
        )
        .replace(/{{text}}/g, modified.text as string)
        .replace(/{{sender}}/g, modified.from as string)
        .replace(/{{subject}}/g, modified.subject)
        .replace(
          /{{header\('(.+)', '(.+)'\)}}/g,
          (m, p1: string, p2: string): string => {
            const headers = modified.headers as Array<{
              key: string;
              value: string;
            }>;
            const header = headers.find(h => h.key == p1);
            return header ? header.value : p2;
          }
        );
  }
}
