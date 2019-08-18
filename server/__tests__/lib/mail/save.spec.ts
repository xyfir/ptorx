import { addAlias } from 'lib/aliases/add';
import { saveMail } from 'lib/mail/save';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';

test('saveMail()', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const user = await getUser(1234);

  const message = await saveMail(
    'raw',
    {
      from: {
        html: '',
        text: 'user@example.com',
        value: []
      },
      headerLines: [{ key: 'Header', line: 'Header: Value' }],
      html: false,
      subject: 'subject',
      text: 'Hello',
      to: {
        html: '',
        text: `user@${process.enve.DOMAIN}`,
        value: []
      },
      textAsHtml: '',
      headers: new Map()
    },
    alias,
    user
  );
  const _message: Ptorx.Message = {
    ...message,
    from: 'user@example.com',
    subject: 'subject',
    raw: 'raw',
    to: `user@${process.enve.DOMAIN}`
  };
  expect(message).toMatchObject(_message);
});
