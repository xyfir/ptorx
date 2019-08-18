import { listDomainUsers } from 'lib/domains/users/list';
import { addDomainUser } from 'lib/domains/users/add';
import { addDomain } from 'lib/domains/add';
import { Ptorx } from 'types/ptorx';

test('listDomainUsers()', async () => {
  const domain = await addDomain({ domain: 'example5.com' }, 1234);
  await addDomainUser('example5.com', 12345);
  const domainUsers = await listDomainUsers(domain.id, 1234);
  expect(domainUsers).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.DomainUserList[0]> = [
    'authorized',
    'created',
    'label',
    'requestKey',
    'domainId'
  ];
  expect(domainUsers[0]).toContainAllKeys(keys);
});
