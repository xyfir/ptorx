import { deleteExpiredMessages } from 'jobs/delete-expired-messages';
import { replyToMessage } from 'lib/messages/reply';
import { deleteMessage } from 'lib/messages/delete';
import { listMessages } from 'lib/messages/list';
import { captureMail } from 'lib/tests/capture-mail';
import { sendMessage } from 'lib/messages/send';
import { addMessage } from 'lib/messages/add';
import { getMessage } from 'lib/messages/get';
import { addAlias } from 'lib/aliases/add';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

// source: https://github.com/nodemailer/mailparser/blob/master/test/fixtures/base64encodedroot.eml
const raw = `From: test@example.com
To: test@${process.enve.DOMAIN}
Subject: subject
Content-Type: image/png;
 name="screenshot.png"
Content-Transfer-Encoding: base64
Content-Disposition: attachment;
 filename="screenshot.png"

iVBORw0KGgoAAAANSUhEUgAAABcAAAAfCAYAAAAMeVbNAAAABHNCSVQICAgIfAhkiAAAABl0
RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAE7SURBVEiJY/T3dfvPQCPARCuD
Rw0fNXwoGM5rmckwoa+dId2ABau8kGUuw4S+doZkHezyeA2nBqCp4bj9RC7gkGOw8nFjsNdR
prLhHMoMofkpDNZC3xkeXDlOyHBWBnGrYIZQlT8YMpxSghhi8u7BDNbinxlOzexjWHbzB2GX
C6mYMlir4JL9jcSWYzDSFWNgeHec4dQzVgZeXlZChv9muL6olmHmBUyXC1nmMtSFSiEEOIQY
xHgZGBhYLRlyGi0ZGBioGaEw+1+eZli24QLDJ+oa/o7h3WcGBgZOBoZPd28y3PhD1XT+jOH8
jXcMDHwGDB52UgwsDFQ1/A/DnS1rGU69Y2VQ8MllqMtLoHIO/XGTYVlPH8OyY3cZPgspMzAO
2dofa2qZ0NdDskEFRSUYYjR1+dAN81HDsQIA4N1NJ84wfR8AAAAASUVORK5CYII=
`;

test('create message', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const message = await addMessage(
    {
      aliasId: alias.id,
      subject: 'subject',
      from: 'test@example.com',
      raw,
      to: `test@${process.enve.DOMAIN}`
    },
    1234
  );
  expect(Object.keys(message).length).toBe(11);
  expect(message.id).toBeNumber();
  expect(message.created).toBeNumber();
  const _message: Ptorx.Message = {
    ...message,
    userId: 1234,
    aliasId: alias.id,
    subject: 'subject',
    from: 'test@example.com',
    raw,
    to: `test@${process.enve.DOMAIN}`,
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

test('send and reply to messages', async () => {
  expect.assertions(8);

  const messages = await listMessages(1234);
  const message = await getMessage(messages[0].id, 1234);

  const promise = captureMail(2, incoming => {
    expect(incoming.text.trim()).toBe('content');
    expect(incoming.from.text).toEndWith(`@${process.enve.DOMAIN}`);
    expect(incoming.to.text).toBe('test@example.com');
    expect(incoming.subject).toBe('subject');
  });

  await sendMessage(
    {
      aliasId: messages[0].aliasId,
      subject: 'subject',
      html: '<div>content</div>',
      text: 'content',
      to: 'test@example.com'
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
