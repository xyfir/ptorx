import * as escapeRegExp from 'escape-string-regexp';
import { ParsedMail } from 'mailparser';
import { getFilter } from 'lib/filters/get';
import { Ptorx } from 'types/ptorx';

export async function filterMail(
  mail: ParsedMail,
  filterId: Ptorx.Filter['id'],
  userId: Ptorx.Filter['userId']
): Promise<boolean> {
  const filter = await getFilter(filterId, userId);
  let pass = false;

  if (!filter.regex) filter.find = escapeRegExp(filter.find);

  const regex = new RegExp(filter.find);
  switch (filter.type) {
    case 'subject':
      pass = regex.test(mail.subject);
      break;
    case 'address':
      pass = regex.test(mail.from.text);
      break;
    case 'text':
      pass = regex.test(mail.text);
      break;
    case 'html':
      pass = mail.html === false ? false : regex.test(mail.html as string);
      break;
    case 'header':
      pass =
        mail.headerLines.map(h => regex.test(h.line)).filter(h => h).length > 0;
      break;
  }

  if (filter.blacklist) pass = !pass;

  return pass;
}
