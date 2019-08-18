import { listMessages } from 'lib/messages/list';
import { addMessage } from 'lib/messages/add';
import { addAlias } from 'lib/aliases/add';
import { Ptorx } from 'types/ptorx';

test('listMessages()', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  await addMessage({ aliasId: alias.id }, 1234);
  const messages = await listMessages(1234);
  const keys: Array<keyof Ptorx.MessageList[0]> = [
    'id',
    'aliasId',
    'created',
    'subject',
    'from'
  ];
  expect(messages[0]).toContainAllKeys(keys);
});
