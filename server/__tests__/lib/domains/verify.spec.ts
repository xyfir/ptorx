import { verifyDomain } from 'lib/domains/verify';
import { addDomain } from 'lib/domains/add';

test('verifyDomain()', async () => {
  const domain = await addDomain({ domain: 'example7.com' }, 1234);
  await expect(verifyDomain(domain.id, 1234)).rejects.toBe(
    'Domain could not be verified'
  );
});
