import { addDomainUser } from 'lib/domains/users/add';
import { addDomain } from 'lib/domains/add';
import { Ptorx } from 'types/ptorx';

test('addDomainUser()', async () => {
  await addDomain({ domain: 'example4.com' }, 1234);
  const domainUser = await addDomainUser('example4.com', 12345);
  expect(Object.keys(domainUser).length).toBe(6);
  expect(domainUser.created).toBeNumber();
  expect(domainUser.requestKey).toBeString();
  expect(domainUser.requestKey).toBeTruthy();
  const _domainUser: Ptorx.DomainUser = {
    ...domainUser,
    userId: 12345,
    label: '',
    authorized: false
  };
  expect(domainUser).toMatchObject(_domainUser);
});
