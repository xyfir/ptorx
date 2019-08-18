import { addDomain } from 'lib/domains/add';
import { Ptorx } from 'types/ptorx';

test('addDomain()', async () => {
  const domain = await addDomain({ domain: 'example.com' }, 1234);
  expect(Object.keys(domain).length).toBe(9);
  expect(domain.id).toBeNumber();
  expect(domain.created).toBeNumber();
  expect(domain.userId).toBe(1234);
  expect(domain.publicKey).toStartWith('v=DKIM1; k=rsa; p=');
  expect(domain.selector).toMatch(/^[a-z]{3,10}\d{2}$/);
  const _domain: Ptorx.Domain = {
    ...domain,
    domain: 'example.com',
    global: false,
    isCreator: true,
    verified: false
  };
  expect(domain).toMatchObject(_domain);
}, 15000);
