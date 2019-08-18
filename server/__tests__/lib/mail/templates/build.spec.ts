import { buildTemplate } from 'lib/mail/templates/build';

test('buildTemplate()', async () => {
  const template = await buildTemplate('verify-primary-email', {
    link: 'https://google.com'
  });
  expect(template.html).toMatch(/Verify Primary Email/);
  expect(template.text).toMatch(/Verify Primary Email/);
});
