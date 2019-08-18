import { deleteExpiredMessages } from 'jobs/delete-expired-messages';
import { listMessages } from 'lib/messages/list';
import { addMessage } from 'lib/messages/add';
import { addAlias } from 'lib/aliases/add';
import { MySQL } from 'lib/MySQL';

test('deleteExpiredMessages()', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const unexpiredMessage = await addMessage({ aliasId: alias.id }, 1234);
  const expiredMessage = await addMessage({ aliasId: alias.id }, 1234);
  const db = new MySQL();
  await db.query('UPDATE messages SET created = 0 WHERE id = ?', [
    expiredMessage.id
  ]);
  await deleteExpiredMessages();
  const messages = await listMessages(1234);
  expect(messages.find(m => m.id == unexpiredMessage.id)).not.toBeUndefined();
  expect(messages.find(m => m.id == expiredMessage.id)).toBeUndefined();
});
