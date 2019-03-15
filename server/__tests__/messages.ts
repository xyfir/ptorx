import 'lib/tests/prepare';
import { getMessage, getMessageAttachmentBin } from 'lib/messages/get';
import { deleteExpiredMessages } from 'jobs/delete-expired-messages';
import { replyToMessage } from 'lib/messages/reply';
import { addAlias } from 'lib/aliases/add';
import { deleteMessage } from 'lib/messages/delete';
import { listMessages } from 'lib/messages/list';
import { captureMail } from 'lib/tests/capture-mail';
import { sendMessage } from 'lib/messages/send';
import { addMessage } from 'lib/messages/add';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

test('create message', async () => {
  const alias = await addAlias(
    { domainId: process.enve.DOMAIN_ID },
    1234
  );
  const message = await addMessage(
    {
      aliasId: alias.id,
      subject: 'subject',
      from: 'sender@domain.com',
      to: `test@${process.enve.DOMAIN}`,
      text: 'Hello World',
      html: '<div>Hello World</div>',
      headers: ['Content-Type: text/html; charset="utf-8"'],
      attachments: [
        {
          contentType: 'text/html',
          filename: 'file.html',
          content: Buffer.from('Hello World'),
          size: 1
        }
      ]
    },
    1234
  );
  expect(Object.keys(message).length).toBe(14);
  expect(message.id).toBeNumber();
  expect(message.created).toBeNumber();
  const _message: Ptorx.Message = {
    ...message,
    userId: 1234,
    aliasId: alias.id,
    subject: 'subject',
    from: 'sender@domain.com',
    to: `test@${process.enve.DOMAIN}`,
    text: 'Hello World',
    html: '<div>Hello World</div>',
    headers: ['Content-Type: text/html; charset="utf-8"'],
    attachments: [
      {
        contentType: 'text/html',
        filename: 'file.html',
        size: 1,
        id: message.attachments[0].id
      }
    ],
    replyTo: null,
    ptorxReplyTo: `${message.id}--${message.key}--reply-x@${
      process.enve.DOMAIN
    }`
  };
  expect(message).toMatchObject(_message);
});

test('list message', async () => {
  const messages = await listMessages(1234);
  expect(messages).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.MessageList[0]> = [
    'id',
    'aliasId',
    'created',
    'subject',
    'from'
  ];
  expect(messages[0]).toContainAllKeys(keys);
});

test('get message with key', async () => {
  const messages = await listMessages(1234);
  const message = await getMessage(messages[0].id, 1234);
  await expect(getMessage(message.id, message.key)).not.toReject();
});

test('get message attachment binary', async () => {
  const messages = await listMessages(1234);
  const message = await getMessage(messages[0].id, 1234);
  const buffer = await getMessageAttachmentBin(message.attachments[0].id, 1234);
  expect(buffer.toString()).toBe('Hello World');
});

test('send and reply to messages', async () => {
  expect.assertions(8);

  const messages = await listMessages(1234);
  const message = await getMessage(messages[0].id, 1234);

  const promise = captureMail(2, incoming => {
    expect(incoming.text.trim()).toBe('content');
    expect(incoming.from.text).toEndWith(`@${process.enve.DOMAIN}`);
    expect(incoming.to.text).toBe('sender@domain.com');
    expect(incoming.subject).toBe('subject');
  });

  await sendMessage(
    {
      aliasId: messages[0].aliasId,
      subject: 'subject',
      html: '<div>content</div>',
      text: 'content',
      to: 'sender@domain.com'
    },
    1234
  );
  await replyToMessage(
    { messageId: message.id, html: '<div>content</div>', text: 'content' },
    1234
  );

  await promise;
}, 10000);

test('delete expired messages', async () => {
  let messages = await listMessages(1234);
  const unexpiredMessage = await getMessage(messages[0].id, 1234);
  unexpiredMessage.attachments = [];
  const expiredMessage = await addMessage(unexpiredMessage, 1234);
  const db = new MySQL();
  await db.query('UPDATE messages SET created = 0 WHERE id = ?', [
    expiredMessage.id
  ]);
  await deleteExpiredMessages();
  messages = await listMessages(1234);
  expect(messages).toBeArrayOfSize(1);
  expect(messages[0].id).not.toBe(expiredMessage.id);
});

test('delete message', async () => {
  let messages = await listMessages(1234);
  const [message] = messages;
  await deleteMessage(message.id, 1234);
  messages = await listMessages(1234);
  expect(messages).toBeArrayOfSize(0);
});
