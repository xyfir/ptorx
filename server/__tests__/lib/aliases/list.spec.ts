import { listAliases } from 'lib/aliases/list';
import { addAlias } from 'lib/aliases/add';
import { Ptorx } from 'types/ptorx';

test('listAliases()', async () => {
  await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const aliases = await listAliases(1234);
  const keys: Array<keyof Ptorx.AliasList[0]> = [
    'fullAddress',
    'created',
    'id',
    'name'
  ];
  expect(aliases[0]).toContainAllKeys(keys);
});
