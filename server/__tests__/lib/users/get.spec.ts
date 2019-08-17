import { getUser } from 'lib/users/get';
import { TIERS } from 'lib/users/tiers';
import { Ptorx } from 'types/ptorx';

test('getUser()', async () => {
  const userId = Date.now();
  const [tier] = TIERS;
  const _user: Ptorx.User = {
    credits: tier.credits,
    email: 'test@example.com',
    userId,
    tier: tier.name,
    tierExpiration: null,
    privateKey: null,
    publicKey: null
  };
  let user = await getUser({ userId, email: 'test@example.com' });
  expect(user).toMatchObject(_user);
  user = await getUser(userId);
  expect(user).toMatchObject(_user);
});
