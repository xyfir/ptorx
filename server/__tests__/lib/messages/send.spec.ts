import { captureMail } from 'lib/tests/capture-mail';
import { sendMessage } from 'lib/messages/send';
import { addMessage } from 'lib/messages/add';
import { addAlias } from 'lib/aliases/add';

test('sendMessage()', async () => {
  expect.assertions(4);

  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const message = await addMessage({ aliasId: alias.id }, 1234);

  const promise = captureMail(1, incoming => {
    expect(incoming.text.trim()).toBe('content');
    expect(incoming.from.text).toEndWith(`@${process.enve.DOMAIN}`);
    expect(incoming.to.text).toBe('test@example.com');
    expect(incoming.subject).toBe('subject');
  });

  await sendMessage(
    {
      aliasId: message.aliasId,
      subject: 'subject',
      html: '<div>content</div>',
      text: 'content',
      to: 'test@example.com'
    },
    1234
  );
  await promise;
}, 10000);
