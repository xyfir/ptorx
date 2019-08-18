import { deleteDomain } from 'lib/domains/delete';
import { listDomains } from 'lib/domains/list';
import { addDomain } from 'lib/domains/add';

test('deleteDomain()', async () => {
  const domain = await addDomain({ domain: 'example6.com' }, 1234);
  await deleteDomain(domain.id, 1234);
  const domains = await listDomains(1234);
  expect(domains.find(d => d.id == domain.id)).toBeUndefined();
});
