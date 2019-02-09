import { SendMailOptions, createTransport } from 'nodemailer';
import { listProxyEmails } from 'lib/proxy-emails/list';
import { startSMTPServer } from 'lib/mail/smtp-server';
import { buildTemplate } from 'lib/mail/templates/build';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { getRecipient } from 'lib/mail/get-recipient';
import { editModifier } from 'lib/modifiers/edit';
import { captureMail } from 'lib/tests/capture-mail';
import { addModifier } from 'lib/modifiers/add';
import { listDomains } from 'lib/domains/list';
import { editFilter } from 'lib/filters/edit';
import { addMessage } from 'lib/messages/add';
import { modifyMail } from 'lib/mail/modify';
import { filterMail } from 'lib/mail/filter';
import { ParsedMail } from 'mailparser';
import { addFilter } from 'lib/filters/add';
import { sendMail } from 'lib/mail/send';
import { saveMail } from 'lib/mail/save';
import * as CONFIG from 'constants/config';
import { Ptorx } from 'types/ptorx';
import 'lib/tests/prepare';

test('build template', async () => {
  const template = await buildTemplate('verify-email', {
    link: 'https://google.com'
  });
  expect(template.html).toMatch(/http.+Verify My Email/);
  expect(template.text).toMatch(/Verify My Email: http/);
});

test('get recipient: non-ptorx email', async () => {
  const recipient = await getRecipient('test@gmail.com');
  const _recipient: Ptorx.Recipient = { address: 'test@gmail.com' };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: proxy email', async () => {
  const proxyEmail = await addProxyEmail(
    {
      domainId: CONFIG.DOMAIN_ID,
      address: 'recipient'
    },
    1234
  );
  const recipient = await getRecipient(`recipient@${CONFIG.DOMAIN}`);
  const _recipient: Ptorx.Recipient = {
    userId: 1234,
    address: `recipient@${CONFIG.DOMAIN}`,
    domainId: CONFIG.DOMAIN_ID,
    proxyEmailId: proxyEmail.id
  };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: bad address on proxy domain', async () => {
  const recipient = await getRecipient(`doesnotexist@${CONFIG.DOMAIN}`);
  const _recipient: Ptorx.Recipient = {
    address: `doesnotexist@${CONFIG.DOMAIN}`
  };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: reply to message', async () => {
  const [proxyEmail] = await listProxyEmails(1234);
  const message = await addMessage({ proxyEmailId: proxyEmail.id }, 1234);
  const recipient = await getRecipient(message.ptorxReplyTo);
  const _recipient: Ptorx.Recipient = {
    userId: 1234,
    message,
    address: message.ptorxReplyTo
  };
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
        text: `user@${CONFIG.DOMAIN}`,
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
    to: `user@${CONFIG.DOMAIN}`,
    text: 'Hello'
  };
  expect(message).toMatchObject(_message);
});

test('filter mail', async () => {
  const match: ParsedMail = {
    attachments: [],
    from: {
      html: '',
      text: 'match@example.com',
      value: []
    },
    headerLines: [{ key: 'Match', line: 'Match: Test' }],
    html: '<div>Match</div>',
    subject: 'Match',
    text: 'Match',
    to: {
      html: '',
      text: `match@${CONFIG.DOMAIN}`,
      value: []
    },
    textAsHtml: '',
    headers: new Map()
  };
  const noMatch: ParsedMail = {
    attachments: [],
    from: {
      html: '',
      text: 'no@domain.com',
      value: []
    },
    headerLines: [{ key: 'No', line: 'No: Test' }],
    html: '<div>No</div>',
    subject: 'No',
    text: 'No',
    to: {
      html: '',
      text: `no@${CONFIG.DOMAIN}`,
      value: []
    },
    textAsHtml: '',
    headers: new Map()
  };

  let filter = await addFilter({ type: 'subject', find: 'Match' }, 1234);
  expect(await filterMail(match, filter.id, 1234)).toBeTrue();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeFalse();

  filter = await editFilter(
    {
      ...filter,
      type: 'address',
      find: '^match@example\\.com$',
      regex: true,
      blacklist: true
    },
    1234
  );
  expect(await filterMail(match, filter.id, 1234)).toBeFalse();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeTrue();

  filter = await editFilter(
    {
      ...filter,
      type: 'text',
      find: 'Match',
      regex: false,
      blacklist: false
    },
    1234
  );
  expect(await filterMail(match, filter.id, 1234)).toBeTrue();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeFalse();

  filter = await editFilter(
    { ...filter, type: 'html', find: '<div>Match</div>' },
    1234
  );
  expect(await filterMail(match, filter.id, 1234)).toBeTrue();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeFalse();

  filter = await editFilter(
    { ...filter, type: 'header', find: 'Match: Test' },
    1234
  );
  expect(await filterMail(match, filter.id, 1234)).toBeTrue();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeFalse();
});

test.only('modify mail', async () => {
  const mail: SendMailOptions = {
    attachments: [],
    headers: [{ key: 'Header', value: 'Value' }],
    subject: 'Hi there',
    sender: 'user@example.com',
    html: '<div>Hello <b>world</b>!</div>',
    from: 'user@example.com',
    text: 'Hello world!',
    to: `user@${CONFIG.DOMAIN}`
  };

  let modifier = await addModifier(
    { target: 'text', template: `"""replace("text", "world", "universe")"""` },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.text).toBe('Hello universe!');

  modifier = await editModifier(
    { ...modifier, target: 'subject', template: `Hello """var("subject")"""` },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.subject).toBe('Hello Hi there');

  modifier = await editModifier(
    {
      ...modifier,
      target: 'html',
      template: `"""replace("html", regex(/w(o|0)?RLD/i), "universe")"""`
    },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.html).toBe('<div>Hello <b>universe</b>!</div>');

  modifier = await editModifier(
    {
      ...modifier,
      target: 'text',
      template: `"""var("from")""" -> """var("to")""" ("""header("Header")""")`
    },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.text).toBe(`user@example.com -> user@${CONFIG.DOMAIN} (Value)`);
});

test('send mail', async () => {
  const [domain] = await listDomains(1234);
  expect.assertions(5);
  const promise = captureMail(1, incoming => {
    expect(incoming.text.trim()).toBe('Hello world');
    expect(incoming.from.text).toBe(`test@${domain.domain}`);
    expect(incoming.to.text).toBe('test@example.com');
    expect(incoming.subject).toBe('Hi');
  });
  await expect(
    sendMail(domain.id, {
      subject: 'Hi',
      from: `test@${domain.domain}`,
      text: 'Hello world',
      to: 'test@example.com'
    })
  ).not.toReject();
  await promise;
}, 10000);

test('smtp server', async () => {
  expect.assertions(11);

  const server = startSMTPServer();

  // Catch REDIRECTED mail
  const promise = captureMail(1, (message, session) => {
    // Envelope from/to should have changed
    expect(
      session.envelope.mailFrom !== false
        ? session.envelope.mailFrom.address
        : ''
    ).toBe(CONFIG.PERSISTENT_PROXY_EMAIL);
    expect(session.envelope.rcptTo[0].address).toBe('test@example.com');

    // Headers from/to should be unchanged
    expect(message.from.text).toBe('You <foo@example.com>');
    expect(message.to.text).toBe(CONFIG.PERSISTENT_PROXY_EMAIL);

    expect(message.subject).toBe('Hi');
    expect(message.text).toBe('Hello world?');
    expect(message.html).toBe('<b>Hello world?</b>');
    expect(message.attachments).toBeArrayOfSize(1);
    expect(message.attachments[0].content.toString()).toBe('Hello World');
    expect(
      message.headerLines.find(h => h.key == 'x-custom-header')
    ).not.toBeUndefined();
    expect(message.replyTo.text).toMatch(
      new RegExp(`^\\d+--.+--reply-x@${CONFIG.DOMAIN}$`)
    );
  });

  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    secure: false,
    host: '127.0.0.1',
    port: CONFIG.SMTP_PORT,
    tls: { rejectUnauthorized: false }
  });
  // foo@example.com -> CONFIG.PERSISTENT_PROXY_EMAIL -> test@example.com
  await transporter.sendMail({
    attachments: [
      {
        contentType: 'text/html',
        filename: 'test.txt',
        content: Buffer.from('Hello World')
      }
    ],
    headers: [{ key: 'X-Custom-Header', value: 'Hello' }],
    subject: 'Hi',
    from: 'You <foo@example.com>',
    html: '<b>Hello world?</b>',
    text: 'Hello world?',
    to: CONFIG.PERSISTENT_PROXY_EMAIL
  });
  await promise;
  await new Promise(r => server.close(r));
});

test('reply to message', async () => {
  expect.assertions(4);
  const server = startSMTPServer();

  const [proxyEmail] = await listProxyEmails(1234);
  const message = await addMessage(
    {
      proxyEmailId: proxyEmail.id,
      subject: 'Hello',
      from: 'test@example.com',
      text: 'Hello World',
      to: proxyEmail.fullAddress
    },
    1234
  );
  // Catch REDIRECTED mail
  const promise = captureMail(1, message => {
    expect(message.text.trim()).toBe('This is a reply');
    expect(message.from.text).toBe(proxyEmail.fullAddress);
    expect(message.to.text).toBe('test@example.com');
    expect(message.subject).toBe('Hello');
  });
  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    host: '127.0.0.1',
    port: CONFIG.SMTP_PORT,
    secure: false,
    tls: { rejectUnauthorized: false }
  });
  // foo@example.com -> --reply-x@CONFIG.DOMAIN -> test@example.com
  await transporter.sendMail({
    subject: 'Hello',
    from: 'foo@example.com',
    text: 'This is a reply',
    to: message.ptorxReplyTo
  });
  await promise;
  await new Promise(r => server.close(r));
});
