import { createTransport } from 'nodemailer';
import { captureMail } from 'lib/tests/capture-mail';
import { addMessage } from 'lib/messages/add';
import { addAlias } from 'lib/aliases/add';
import { startMTA } from 'lib/mail/mta';
import { SRS } from 'sender-rewriting-scheme';

test('lib/mail/mta forward incoming', async () => {
  expect.assertions(11);

  const server = startMTA();

  // Catch REDIRECTED mail
  const promise = captureMail(1, (message, session) => {
    expect(session.envelope.rcptTo[0].address).toBe('user@example.com');
    expect(
      session.envelope.mailFrom && session.envelope.mailFrom.address
    ).toMatch(/^SRS0=\w{4}=\w{2}=example\.com=foo@/);

    expect(message.from.text).toBe('You <foo@example.com>');
    expect(message.to.text).toBe(process.enve.PERSISTENT_ALIAS);

    expect(message.subject).toBe('Hi');
    expect(message.text).toBe('Hello world?');
    expect(message.html).toBe('<b>Hello world?</b>');
    expect(message.attachments).toBeArrayOfSize(1);
    expect(message.attachments[0].content.toString()).toBe('Hello World');
    expect(message.headers.has('dkim-signature')).toBeTrue();
    expect(message.replyTo.text).toMatch(
      new RegExp(`^\\d+--.+--reply-x@${process.enve.DOMAIN}$`)
    );
  });

  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    secure: false,
    host: '127.0.0.1',
    port: process.enve.MTA_PORT,
    tls: { rejectUnauthorized: false }
  });
  // foo@example.com -> process.enve.PERSISTENT_ALIAS -> user@example.com
  await transporter.sendMail({
    attachments: [
      {
        contentType: 'text/html',
        filename: 'test.txt',
        content: Buffer.from('Hello World')
      }
    ],
    headers: [
      {
        key: 'DKIM-Signature',
        value:
          'v=1; d=example.com; h=Date:From:To:Subject:MIME-Version:Content-Type; bh=yZ7tYf=; b=f+pK2Y='
      }
    ],
    subject: 'Hi',
    from: 'You <foo@example.com>',
    html: '<b>Hello world?</b>',
    text: 'Hello world?',
    to: process.enve.PERSISTENT_ALIAS
  });
  await promise;
  await new Promise(r => server.close(r));
});

test('lib/mail/mta remail incoming', async () => {
  expect.assertions(8);

  const server = startMTA();

  // Catch REDIRECTED mail
  const promise = captureMail(1, (message, session) => {
    expect(session.envelope.rcptTo[0].address).toBe('user@example.com');
    expect(
      session.envelope.mailFrom && session.envelope.mailFrom.address
    ).toMatch(/^SRS0=\w{4}=\w{2}=example\.com=foo@/);
    expect(message.from.text).toMatch(process.enve.PERSISTENT_ALIAS);
    expect(message.to.text).toBe(process.enve.PERSISTENT_ALIAS);
    expect(message.subject).toBe('Hi');
    expect(message.text).toBe('Hello world?');
    expect(message.html).toBe('<b>Hello world?</b>');
    expect(message.replyTo.text).toMatch(
      new RegExp(`^\\d+--.+--reply-x@${process.enve.DOMAIN}$`)
    );
  });

  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    secure: false,
    host: '127.0.0.1',
    port: process.enve.MTA_PORT,
    tls: { rejectUnauthorized: false }
  });
  await transporter.sendMail({
    subject: 'Hi',
    from: 'You <foo@example.com>',
    html: '<b>Hello world?</b>',
    text: 'Hello world?',
    to: process.enve.PERSISTENT_ALIAS
  });
  await promise;
  await new Promise(r => server.close(r));
});

test('lib/mail/mta reply to message', async () => {
  expect.assertions(4);
  const server = startMTA();

  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const message = await addMessage(
    {
      aliasId: alias.id,
      subject: 'Hello',
      from: 'user@example.com',
      to: alias.fullAddress
    },
    1234
  );
  // Catch REDIRECTED mail
  const promise = captureMail(1, message => {
    expect(message.text.trim()).toBe('This is a reply');
    expect(message.from.text).toBe(alias.fullAddress);
    expect(message.to.text).toBe('user@example.com');
    expect(message.subject).toBe('Hello');
  });
  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    host: '127.0.0.1',
    port: process.enve.MTA_PORT,
    secure: false,
    tls: { rejectUnauthorized: false }
  });
  // foo@example.com -> --reply-x@process.enve.DOMAIN -> user@example.com
  await transporter.sendMail({
    subject: 'Hello',
    from: 'foo@example.com',
    text: 'This is a reply',
    to: message.ptorxReplyTo
  });
  await promise;
  await new Promise(r => server.close(r));
});

test('lib/mail/mta bounced mail', async () => {
  expect.assertions(4);

  const server = startMTA();
  const srs = new SRS({ secret: process.enve.SRS_KEY });

  // Catch REDIRECTED mail
  const promise = captureMail(1, (message, session) => {
    expect(session.envelope.rcptTo[0].address).toBe('bounce@example.com');
    expect(session.envelope.mailFrom).toMatchObject({
      address: '',
      args: false
    });
    expect(message.text.trim()).toBe('Bounce');
    expect(message.subject).toBe('Bounce');
  });

  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    secure: false,
    host: '127.0.0.1',
    port: process.enve.MTA_PORT,
    tls: { rejectUnauthorized: false }
  });
  const to = srs.forward('bounce@example.com', 'ptorx.com');
  await transporter.sendMail({
    envelope: { from: '', to },
    subject: 'Bounce',
    from: 'bounce@example.org',
    text: 'Bounce',
    to
  });
  await promise;
  await new Promise(r => server.close(r));
});
