import { getDomainAuth } from 'lib/domains/get';
import { addDomain } from 'lib/domains/add';
import { Ptorx } from 'types/ptorx';

test('getDomainAuth()', async () => {
  const domain = await addDomain({ domain: 'example3.com' }, 1234);
  const auth = await getDomainAuth(domain.id);
  const keys: Array<keyof Ptorx.DomainAuth> = [
    'domain',
    'privateKey',
    'publicKey',
    'selector'
  ];
  expect(auth).toContainAllKeys(keys);
  expect(auth.privateKey).toMatch(/RSA PRIVATE KEY/);
});
