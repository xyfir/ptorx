import { replyToMessage } from 'lib/messages/reply';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { deleteMessage } from 'lib/messages/delete';
import { listMessages } from 'lib/messages/list';
import { sendMessage } from 'lib/messages/send';
import { addMessage } from 'lib/messages/add';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';
import 'lib/tests/prepare';
import { getMessage, getMessageAttachmentBin } from 'lib/messages/get';

test('create message', async () => {
  const proxyEmail = await addProxyEmail(
    { domainId: 1, address: '', name: '' },
    1234
  );
  const message = await addMessage(
    {
      proxyEmailId: proxyEmail.id,
      subject: 'subject',
      from: 'sender@domain.com',
      to: 'test@ptorx.com',
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
  expect(Object.keys(message).length).toBe(11);
  expect(message.id).toBeNumber();
  expect(message.created).toBeNumber();
  const _message: Ptorx.Message = {
    ...message,
    proxyEmailId: proxyEmail.id,
    subject: 'subject',
    from: 'sender@domain.com',
    to: 'test@ptorx.com',
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
    ]
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

test('get message attachment binary', async () => {
  const messages = await listMessages(1234);
  const message = await getMessage(messages[0].id, 1234);
  const buffer = await getMessageAttachmentBin(message.attachments[0].id, 1234);
  expect(buffer.toString()).toBe('Hello World');
});

test('send message', async () => {
  const messages = await listMessages(1234);
  await expect(
    sendMessage(
      {
        proxyEmailId: messages[0].proxyEmailId,
        content: 'content',
        subject: 'subject',
        to: 'to@example.com'
      },
      1234
    )
  ).not.toReject();
});

test('reply to message', async () => {
  const [message] = await listMessages(1234);
  await expect(replyToMessage(message.id, 'content', 1234)).not.toReject();
});

test('delete message', async () => {
  let messages = await listMessages(1234);
  const [message] = messages;
  await deleteMessage(message.id, 1234);
  messages = await listMessages(1234);
  expect(messages).toBeArrayOfSize(0);

  // Fully delete proxy email
  const db = new MySQL();
  await db.query('DELETE FROM proxy_emails ORDER BY created DESC LIMIT 1');
  db.release();
});
