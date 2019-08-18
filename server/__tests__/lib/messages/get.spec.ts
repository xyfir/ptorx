import { addMessage } from 'lib/messages/add';
import { getMessage } from 'lib/messages/get';
import { addAlias } from 'lib/aliases/add';

test('getMessage() key', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const message = await addMessage({ aliasId: alias.id }, 1234);
  await expect(getMessage(message.id, message.key)).not.toReject();
});
