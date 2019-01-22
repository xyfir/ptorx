import { listProxyEmails } from 'lib/proxy-emails/list';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { getRecipient } from 'lib/mail/get-recipient';
import { addMessage } from 'lib/messages/add';
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
