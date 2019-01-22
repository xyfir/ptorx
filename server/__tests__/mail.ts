import { listProxyEmails } from 'lib/proxy-emails/list';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { getRecipient } from 'lib/mail/get-recipient';
import { addMessage } from 'lib/messages/add';
import { saveMail } from 'lib/mail/save';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('get recipient: non-ptorx email', async () => {
  const recipient = await getRecipient('test@gmail.com');
  const _recipient: Ptorx.Recipient = { address: 'test@gmail.com' };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: proxy email', async () => {
  const proxyEmail = await addProxyEmail(
    { address: 'recipient', domainId: 1, name: '' },
    1234
  );
  const recipient = await getRecipient('recipient@ptorx.com');
  const _recipient: Ptorx.Recipient = {
    userId: 1234,
    address: 'recipient@ptorx.com',
    domainId: 1,
    proxyEmailId: proxyEmail.id
  };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: bad address on proxy domain', () =>
  expect(getRecipient('doesnotexist@ptorx.com')).toReject());

test('get recipient: reply to message', async () => {
  const [proxyEmail] = await listProxyEmails(1234);
  const message = await addMessage({ proxyEmailId: proxyEmail.id }, 1234);
  const address = `1234--${message.id}--${message.key}--reply@ptorx.com`;
  const recipient = await getRecipient(address);
  const _recipient: Ptorx.Recipient = { userId: 1234, message, address };
  expect(recipient).toMatchObject(_recipient);
});

test('save mail', async () => {
  const proxyEmails = await listProxyEmails(1234);
  const proxyEmail = await getProxyEmail(proxyEmails[0].id, 1234);
  const message = await saveMail(
    {
      attachments: [
        {
          checksum: 'abc123',
          content: Buffer.from('Hello World'),
          contentDisposition: 'attachment',
          contentType: 'text/html',
          filename: 'test.txt',
          headers: new Map(),
          related: false,
          size: 11,
          type: 'attachment'
        }
      ],
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
        text: 'user@ptorx.com',
        value: []
      },
      textAsHtml: '',
      headers: new Map()
    },
    proxyEmail
  );
  const _message: Ptorx.Message = {
    ...message,
    attachments: [
      {
        contentType: 'text/html',
        filename: 'test.txt',
        size: 11,
        id: message.attachments[0].id
      }
    ],
    from: 'user@example.com',
    headers: ['Header: Value'],
    html: null,
    subject: 'subject',
    to: 'user@ptorx.com',
    text: 'Hello'
  };
  expect(message).toMatchObject(_message);
});
