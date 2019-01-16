import { replyToMessage } from 'lib/messages/reply';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { deleteMessage } from 'lib/messages/delete';
import { listMessages } from 'lib/messages/list';
import { sendMessage } from 'lib/messages/send';
import { addMessage } from 'lib/messages/add';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';
import 'lib/tests/prepare';

test('create message', async () => {
  const proxyEmail = await addProxyEmail(
    { domainId: 1, address: '', name: '' },
    1234
  );
  const message = await addMessage(
    {
      proxyEmailId: proxyEmail.proxyEmailId,
      sender: 'sender@domain.com',
      subject: 'subject',
      type: 0
    },
    1234
  );
  expect(Object.keys(message).length).toBe(6);
  expect(message.id).toBeString();
  expect(message.id).toBeTruthy();
  expect(message.created).toBeNumber();
  expect(message.proxyEmailId).toBe(proxyEmail.proxyEmailId);
  const _message: Ptorx.Message = {
    ...message,
    sender: 'sender@domain.com',
    subject: 'subject',
    type: 0
  };
  expect(message).toMatchObject(_message);
});

test('list message', async () => {
  const messages = await listMessages(1234);
  expect(messages).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.MessageList[0]> = [
    'created',
    'id',
    'proxyEmailId',
    'sender',
    'subject',
    'type'
  ];
  expect(messages[0]).toContainAllKeys(keys);
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
