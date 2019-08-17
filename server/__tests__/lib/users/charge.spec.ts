import { chargeCredits } from 'lib/users/charge';
import { getUser } from 'lib/users/get';
import { TIERS } from 'lib/users/tiers';

test('chargeCredits()', async () => {
  const [tier] = TIERS;
  let user = await getUser({ userId: Date.now(), email: 'test@example.com' });
  user = await chargeCredits(user, 3);
  expect(user.credits).toBe(tier.credits - 3);
  user = await chargeCredits(user, tier.credits);
  expect(user.credits).toBe(0);
});
