import { promisify } from 'util';
import { readFile } from 'fs';
import { render } from 'ejs';

const _readFile = promisify(readFile);

export async function buildTemplate(
  name: 'verify-email',
  data: object
): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    _readFile(`./lib/mail/templates/${name}.html`, 'utf8'),
    _readFile(`./lib/mail/templates/${name}.txt`, 'utf8')
  ]);
  return {
    html: render(html, data, {}),
    text: render(text, data, {})
  };
}
