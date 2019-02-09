import { SendMailOptions } from 'nodemailer';
import * as escapeRegExp from 'escape-string-regexp';
import { getModifier } from 'lib/modifiers/get';
import { Ptorx } from 'types/ptorx';

const getMailValue = (mail: SendMailOptions, key: string): string =>
  typeof mail[key] == 'string' ? mail[key] : '';

export async function modifyMail(
  mail: SendMailOptions,
  modifierId: Ptorx.Modifier['id'],
  userId: Ptorx.Modifier['userId']
): Promise<void> {
  const modifier = await getModifier(modifierId, userId);
  mail[modifier.target] = modifier.template
    .replace(
      /"""var\("([a-z]+)"\)"""/g,
      (m, key: string): string => getMailValue(mail, key)
    )
    .replace(
      /"""header\("([\w-]+)"\)"""/g,
      (m, key: string): string => {
        const headers = mail.headers as Array<{
          key: string;
          value: string;
        }>;
        const header = headers.find(h => h.key == key);
        return header ? header.value : '';
      }
    )
    .replace(
      /"""replace\("(\w+)", regex\(\/(.+)\/([gimsuy]*)\), "(.+)"\)"""/g,
      (
        m,
        key: string,
        pattern: string,
        flags: string,
        replacement: string
      ): string =>
        getMailValue(mail, key).replace(new RegExp(pattern, flags), replacement)
    )
    .replace(
      /"""replace\("(\w+)", "(.+)", "(.+)"\)"""/g,
      (m, key: string, substr: string, replacement: string): string =>
        getMailValue(mail, key).replace(
          new RegExp(escapeRegExp(substr), 'gi'),
          replacement
        )
    );
}
