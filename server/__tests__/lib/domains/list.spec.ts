import { listDomains } from 'lib/domains/list';
import { addDomain } from 'lib/domains/add';
import { Ptorx } from 'types/ptorx';

test('listDomains()', async () => {
  await addDomain({ domain: 'example2.com' }, 1234);
  const domains = await listDomains(1234);
  const keys: Array<keyof Ptorx.DomainList[0]> = [
    'created',
    'domain',
    'global',
    'id',
    'isCreator'
  ];
  expect(domains[0]).toContainAllKeys(keys);
});
