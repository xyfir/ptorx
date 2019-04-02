import 'lib/tests/prepare';
import { createTransport } from 'nodemailer';
import { captureMail } from 'lib/tests/capture-mail';
import { addAlias } from 'lib/aliases/add';
import { startMSA } from 'lib/mail/msa';

test('send mail through msa', async () => {
  expect.assertions(7);

  const server = startMSA();
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);

  // Catch mail that MSA sends out
  const promise = captureMail(1, (message, session) => {
    expect(session.envelope.rcptTo[0].address).toBe('foo@example.com');
    expect(session.envelope.mailFrom && session.envelope.mailFrom.address).toBe(
      alias.fullAddress
    );
    expect(message.from.text).toBe(`Test <${alias.fullAddress}>`);
    expect(message.to.text).toBe('foo@example.com');
    expect(message.subject).toBe('Hi');
    expect(message.text).toBe('Hello world?');
    expect(message.html).toBe('<b>Hello world?</b>');
  });

  // Send to MSA
  const transporter = createTransport({
    secure: false,
    host: '127.0.0.1',
    port: process.enve.MSA_PORT,
    auth: {
      user: alias.fullAddress,
      pass: alias.smtpKey
    },
    tls: { rejectUnauthorized: false }
  });
  await transporter.sendMail({
    subject: 'Hi',
    from: `Test <${alias.fullAddress}>`,
    html: '<b>Hello world?</b>',
    text: 'Hello world?',
    to: 'foo@example.com'
  });
  await promise;
  await new Promise(r => server.close(r));
});
