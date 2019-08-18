import { deleteMessage } from 'lib/messages/delete';
import { listMessages } from 'lib/messages/list';
import { addMessage } from 'lib/messages/add';
import { addAlias } from 'lib/aliases/add';

test('deleteMessage()', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const message = await addMessage({ aliasId: alias.id }, 1234);
  await deleteMessage(message.id, 1234);
  const messages = await listMessages(1234);
  expect(messages.find(m => m.id == message.id)).toBeUndefined();
});
