import 'lib/tests/prepare';
import { SendMailOptions, createTransport } from 'nodemailer';
import { listAliases } from 'lib/aliases/list';
import { startSMTPServer } from 'lib/mail/smtp-server';
import { buildTemplate } from 'lib/mail/templates/build';
import { addAlias } from 'lib/aliases/add';
import { getAlias } from 'lib/aliases/get';
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
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import { SRS } from 'sender-rewriting-scheme';

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

test('get recipient: alias', async () => {
  const alias = await addAlias(
    {
      domainId: process.enve.DOMAIN_ID,
      address: 'recipient'
    },
    1234
  );
  const user = await getUser(1234);
  const recipient = await getRecipient(`recipient@${process.enve.DOMAIN}`);
  const _recipient: Ptorx.Recipient = {
    user,
    address: `recipient@${process.enve.DOMAIN}`,
    domainId: process.enve.DOMAIN_ID,
    aliasId: alias.id
  };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: bad address on alias domain', async () => {
  const recipient = await getRecipient(`doesnotexist@${process.enve.DOMAIN}`);
  const _recipient: Ptorx.Recipient = {
    address: `doesnotexist@${process.enve.DOMAIN}`
  };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: reply to message', async () => {
  const [alias] = await listAliases(1234);
  const message = await addMessage({ aliasId: alias.id }, 1234);
  const user = await getUser(1234);
  const recipient = await getRecipient(message.ptorxReplyTo);
  const _recipient: Ptorx.Recipient = {
    user,
    message,
    address: message.ptorxReplyTo
  };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: srs', async () => {
  const srs = new SRS({ secret: process.enve.SRS_KEY });
  const forwarded = srs.forward('test@gmail.com', 'ptorx.com');
  const recipient = await getRecipient(forwarded);
  const _recipient: Ptorx.Recipient = {
    address: forwarded,
    bounceTo: 'test@gmail.com'
  };
  expect(recipient).toMatchObject(_recipient);
});

test('get recipient: bad srs', async () => {
  const recipient = await getRecipient('SRS0=ABCD=AB=gmail.com=test@ptorx.com');
  const _recipient: Ptorx.Recipient = {
    address: 'SRS0=ABCD=AB=gmail.com=test@ptorx.com'
  };
  expect(recipient).toMatchObject(_recipient);
});

test('save mail', async () => {
  const aliases = await listAliases(1234);
  const alias = await getAlias(aliases[0].id, 1234);
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
        text: `user@${process.enve.DOMAIN}`,
        value: []
      },
      textAsHtml: '',
      headers: new Map()
    },
    alias
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
    to: `user@${process.enve.DOMAIN}`,
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
      text: `match@${process.enve.DOMAIN}`,
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
      text: `no@${process.enve.DOMAIN}`,
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
    to: `user@${process.enve.DOMAIN}`
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
  expect(mail.text).toBe(
    `user@example.com -> user@${process.enve.DOMAIN} (Value)`
  );
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

test('forward incoming mail', async () => {
  expect.assertions(11);

  const server = startSMTPServer();

  // Catch REDIRECTED mail
  const promise = captureMail(1, (message, session) => {
    expect(session.envelope.rcptTo[0].address).toBe('test@example.com');
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
    expect(
      message.headerLines.find(h => h.key == 'x-custom-header')
    ).not.toBeUndefined();
    expect(message.replyTo.text).toMatch(
      new RegExp(`^\\d+--.+--reply-x@${process.enve.DOMAIN}$`)
    );
  });

  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    secure: false,
    host: '127.0.0.1',
    port: process.enve.SMTP_PORT,
    tls: { rejectUnauthorized: false }
  });
  // foo@example.com -> process.enve.PERSISTENT_ALIAS -> test@example.com
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
    to: process.enve.PERSISTENT_ALIAS
  });
  await promise;
  await new Promise(r => server.close(r));
});

test('reply to message', async () => {
  expect.assertions(4);
  const server = startSMTPServer();

  const [alias] = await listAliases(1234);
  const message = await addMessage(
    {
      aliasId: alias.id,
      subject: 'Hello',
      from: 'test@example.com',
      text: 'Hello World',
      to: alias.fullAddress
    },
    1234
  );
  // Catch REDIRECTED mail
  const promise = captureMail(1, message => {
    expect(message.text.trim()).toBe('This is a reply');
    expect(message.from.text).toBe(alias.fullAddress);
    expect(message.to.text).toBe('test@example.com');
    expect(message.subject).toBe('Hello');
  });
  // Send to ACTUAL SMTP server
  const transporter = createTransport({
    host: '127.0.0.1',
    port: process.enve.SMTP_PORT,
    secure: false,
    tls: { rejectUnauthorized: false }
  });
  // foo@example.com -> --reply-x@process.enve.DOMAIN -> test@example.com
  await transporter.sendMail({
    subject: 'Hello',
    from: 'foo@example.com',
    text: 'This is a reply',
    to: message.ptorxReplyTo
  });
  await promise;
  await new Promise(r => server.close(r));
});

test('bounced mail', async () => {
  expect.assertions(4);

  const server = startSMTPServer();
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
    port: process.enve.SMTP_PORT,
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
