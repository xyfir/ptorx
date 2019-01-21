import * as escapeRegExp from 'escape-string-regexp';
import { ParsedMail } from 'mailparser';
import { getFilter } from 'lib/filters/get';
import { Ptorx } from 'typings/ptorx';

export async function filterMail(
  original: ParsedMail,
  filterId: Ptorx.Filter['id'],
  userId: Ptorx.Filter['userId']
): Promise<boolean> {
  const filter = await getFilter(filterId, userId);
  let pass = false;

  // Escape regex if filter is not using regex
  if (!filter.regex && filter.type != 'header')
    filter.find = escapeRegExp(filter.find);

  const regex = new RegExp(filter.find);
  switch (filter.type) {
    case 'subject':
      pass = regex.test(original.subject);
      break;
    case 'address':
      pass = regex.test(original.from.text);
      break;
    case 'text':
      pass = regex.test(original.text);
      break;
    case 'html':
      pass =
        original.html === false ? false : regex.test(original.html as string);
      break;
    case 'header':
      pass =
        original.headerLines.map(h => regex.test(h.line)).filter(h => h)
          .length > 0;
      break;
  }

  // Flip value if blacklist
  if (filter.blacklist) pass = !pass;

  return pass;
}
