import { deleteAlias } from 'lib/aliases/delete';
import { listAliases } from 'lib/aliases/list';
import { addAlias } from 'lib/aliases/add';

test('deleteAlias()', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  await deleteAlias(alias.id, 1234);
  const aliases = await listAliases(1234);
  expect(aliases.find(e => e.id == alias.id)).toBeUndefined();
});
