import { captureMail } from 'lib/tests/capture-mail';
import { addDomain } from 'lib/domains/add';
import { sendMail } from 'lib/mail/send';

test('sendMail()', async () => {
  const domain = await addDomain({ domain: 'sendmail.com' }, 1234);
  expect.assertions(5);
  const promise = captureMail(1, incoming => {
    expect(incoming.text.trim()).toBe('Hello world');
    expect(incoming.from.text).toBe(`test@${domain.domain}`);
    expect(incoming.to.text).toBe('test@example.com');
    expect(incoming.subject).toBe('Hi');
  });
  await expect(
    sendMail(
      {
        subject: 'Hi',
        from: `test@${domain.domain}`,
        text: 'Hello world',
        to: 'test@example.com'
      },
      domain.id
    )
  ).not.toReject();
  await promise;
}, 10000);
