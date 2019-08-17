import { finishPayment, startPayment } from 'lib/payments/pay';
import { verifyJWT, signJWT } from 'lib/jwt';
import { getUser } from 'lib/users/get';
import { TIERS } from 'lib/users/tiers';
import { Ptorx } from 'types/ptorx';

test('finishPayment(), startPayment()', async () => {
  const [, tier] = TIERS;
  const { url } = await startPayment(
    { tier: tier.name, duration: 'month' },
    1234
  );
  const { id }: { id: Ptorx.Payment['id'] } = await verifyJWT(
    url.split('?jwt=')[1]
  );
  const payment: Partial<Ptorx.Payment> = { id };
  let jwt = await signJWT(payment, '1d');
  await expect(finishPayment(jwt, 1234)).toReject();
  payment.paid = Date.now();
  jwt = await signJWT(payment, '1d');
  await expect(finishPayment(jwt, 1234)).not.toReject();
  await expect(finishPayment(jwt, 1234)).toReject();

  const user = await getUser(1234);
  expect(user.tier).toBe(tier.name);
  expect(user.tierExpiration).toBeNumber();
  expect(user.credits).toBe(tier.credits);
});
