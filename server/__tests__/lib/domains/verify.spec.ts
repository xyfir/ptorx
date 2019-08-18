import { verifyDomain } from 'lib/domains/verify';
import { addDomain } from 'lib/domains/add';
import * as dns from 'dns';

test('verifyDomain()', async () => {
  const domain = await addDomain({ domain: 'example7.com' }, 1234);

  // No key
  (dns as any).resolveTxt = jest.fn((d, fn) => fn(null, []));
  await expect(verifyDomain(domain.id, 1234)).rejects.toBe(
    'Could not find domain key'
  );

  // Bad key
  (dns as any).resolveTxt = jest.fn((d, fn) => fn(null, [['bad']]));
  await expect(verifyDomain(domain.id, 1234)).rejects.toBe(
    'Invalid domain key'
  );

  // Good key
  (dns as any).resolveTxt = jest.fn((d, fn) => fn(null, [[domain.publicKey]]));
  await expect(verifyDomain(domain.id, 1234)).not.toReject();
});
