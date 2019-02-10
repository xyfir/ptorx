import { getMessage, getMessageAttachmentBin } from 'lib/messages/get';
import { replyToMessage } from 'lib/messages/reply';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { deleteMessage } from 'lib/messages/delete';
import { listMessages } from 'lib/messages/list';
import { captureMail } from 'lib/tests/capture-mail';
import { sendMessage } from 'lib/messages/send';
import { addMessage } from 'lib/messages/add';
import * as CONFIG from 'constants/config';
import { Ptorx } from 'types/ptorx';
import 'lib/tests/prepare';

test('create message', async () => {
  const proxyEmail = await addProxyEmail({ domainId: CONFIG.DOMAIN_ID }, 1234);
  const message = await addMessage(
    {
      proxyEmailId: proxyEmail.id,
      subject: 'subject',
      from: 'sender@domain.com',
      to: `test@${CONFIG.DOMAIN}`,
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
    proxyEmailId: proxyEmail.id,
    subject: 'subject',
    from: 'sender@domain.com',
    to: `test@${CONFIG.DOMAIN}`,
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
    ptorxReplyTo: `${message.id}--${message.key}--reply-x@${CONFIG.DOMAIN}`
  };
  expect(message).toMatchObject(_message);
});

test('list message', async () => {
  const messages = await listMessages(1234);
  expect(messages).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.MessageList[0]> = [
    'id',
    'proxyEmailId',
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
  expect.assertions(10);

  const messages = await listMessages(1234);
  const message = await getMessage(messages[0].id, 1234);

  captureMail(2, incoming => {
    expect(incoming.text.trim()).toBe('content');
    expect(incoming.from.text).toEndWith(`@${CONFIG.DOMAIN}`);
    expect(incoming.to.text).toBe('sender@domain.com');
    expect(incoming.subject).toBe('subject');
  });

  await expect(
    sendMessage(
      {
        proxyEmailId: messages[0].proxyEmailId,
        subject: 'subject',
        html: '<div>content</div>',
        text: 'content',
        to: 'sender@domain.com'
      },
      1234
    )
  ).not.toReject();
  await expect(
    replyToMessage(
      { messageId: message.id, html: '<div>content</div>', text: 'content' },
      1234
    )
  ).not.toReject();
}, 10000);

test('delete message', async () => {
  let messages = await listMessages(1234);
  const [message] = messages;
  await deleteMessage(message.id, 1234);
  messages = await listMessages(1234);
  expect(messages).toBeArrayOfSize(0);
});
