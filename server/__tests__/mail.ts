import { SendMailOptions, createTransport } from 'nodemailer';
import { listProxyEmails } from 'lib/proxy-emails/list';
import { startSMTPServer } from 'lib/mail/smtp-server';
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
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('get recipient: non-ptorx email', async () => {
  const recipient = await getRecipient('test@gmail.com');
  const _recipient: Ptorx.Recipient = { address: 'test@gmail.com' };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: proxy email', async () => {
  const proxyEmail = await addProxyEmail(
    {
      domainId: CONFIG.TESTS.PERSISTENT_DOMAIN_ID,
      address: 'recipient'
    },
    1234
  );
  const recipient = await getRecipient(
    `recipient@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`
  );
  const _recipient: Ptorx.Recipient = {
    userId: 1234,
    address: `recipient@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`,
    domainId: CONFIG.TESTS.PERSISTENT_DOMAIN_ID,
    proxyEmailId: proxyEmail.id
  };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: bad address on proxy domain', async () => {
  const recipient = await getRecipient(
    `doesnotexist@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`
  );
  const _recipient: Ptorx.Recipient = {
    address: `doesnotexist@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`
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
        text: `user@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`,
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
    to: `user@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`,
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
      text: `match@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`,
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
      text: `no@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`,
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

test('modify mail', async () => {
  const mail: SendMailOptions = {
    attachments: [],
    headers: [{ key: 'Header', value: 'Value' }],
    subject: 'Hi there',
    sender: 'user@example.com',
    html: '<div>Hello <b>world</b>!</div>',
    from: 'user@example.com',
    text: 'Hello world!',
    to: `user@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}`
  };

  let modifier = await addModifier(
    {
      type: 'replace',
      find: 'world',
      replacement: 'universe',
      regex: false,
      flags: ''
    },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.text).toBe('Hello universe!');
  expect(mail.html).toBe('<div>Hello <b>universe</b>!</div>');

  modifier = await editModifier(
    { ...modifier, type: 'subject', subject: 'subject' },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.subject).toBe('subject');

  modifier = await editModifier(
    { ...modifier, type: 'tag', prepend: true, tag: 'tag: ' },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.subject).toBe('tag: subject');

  modifier = await editModifier(
    {
      ...modifier,
      type: 'builder',
      target: 'text',
      template: '{{from}}\n\n{{text}}'
    },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.text).toBe('user@example.com\n\nHello universe!');

  modifier = await editModifier({ ...modifier, type: 'text-only' }, 1234);
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.html).toBeUndefined();
});

test('send mail', async () => {
  const [domain] = await listDomains(1234);
  expect.assertions(5);
  captureMail(1, incoming => {
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
}, 10000);

test('smtp server', async () => {
  expect.assertions(12);

  const server = startSMTPServer();

  // Catch REDIRECTED mail
  captureMail(1, (message, session) => {
    // Envelope from/to should have changed
    expect(
      session.envelope.mailFrom !== false
        ? session.envelope.mailFrom.address
        : ''
    ).toBe(CONFIG.TESTS.PERSISTENT_PROXY_EMAIL);
    expect(session.envelope.rcptTo[0].address).toBe('test@example.com');

    // Headers from/to should be unchanged
    expect(message.from.text).toBe('You <foo@example.com>');
    expect(message.to.text).toBe(CONFIG.TESTS.PERSISTENT_PROXY_EMAIL);

    expect(message.subject).toBe('Hi');
    expect(message.text).toBe('Hello world?');
    expect(message.html).toBe('<b>Hello world?</b>');
    expect(message.attachments).toBeArrayOfSize(1);
    expect(message.attachments[0].content.toString()).toBe('Hello World');
    expect(
      message.headerLines.find(h => h.key == 'x-custom-header')
    ).not.toBeUndefined();
    expect(message.replyTo.text).toMatch(
      new RegExp(`^\\d+--.+--reply@${CONFIG.TESTS.PERSISTENT_DOMAIN_NAME}$`)
    );
  });

  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    host: '127.0.0.1',
    port: CONFIG.SMTP_PORT,
    secure: false,
    tls: { rejectUnauthorized: false }
  });
  // foo@example.com -> CONFIG.TESTS.PERSISTENT_PROXY_EMAIL -> test@example.com
  await expect(
    transporter.sendMail({
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
      to: CONFIG.TESTS.PERSISTENT_PROXY_EMAIL
    })
  ).not.toReject();

  await new Promise(r => server.close(r));
});

test('reply to message', async () => {
  expect.assertions(5);
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
  captureMail(1, message => {
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
  // foo@example.com -> ...--reply@CONFIG.TESTS.PERSISTENT_DOMAIN_NAME -> test@example.com
  await expect(
    transporter.sendMail({
      subject: 'Hello',
      from: 'foo@example.com',
      text: 'This is a reply',
      to: message.ptorxReplyTo
    })
  ).not.toReject();

  await new Promise(r => server.close(r));
});
