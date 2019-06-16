import 'lib/tests/prepare';
import { finishPayment } from 'lib/payments/finish';
import { startPayment } from 'lib/payments/start';
import { addPayment } from 'lib/payments/add';
import { verifyJWT } from 'lib/jwt/verify';
import { getUser } from 'lib/users/get';
import { signJWT } from 'lib/jwt/sign';
import { TIERS } from 'lib/users/tiers';
import { Ptorx } from 'types/ptorx';

test('create payment', async () => {
  const paid = Date.now();
  const payment = await addPayment(
    { duration: 'month', tier: 'premium', paid },
    1234
  );
  expect(Object.keys(payment).length).toBe(6);
  expect(payment.id).toBeNumber();
  expect(payment.userId).toBe(1234);
  const _payment: Ptorx.Payment = {
    ...payment,
    amount: 150,
    duration: 'month',
    tier: 'premium',
    paid
  };
  expect(payment).toMatchObject(_payment);
});

test('start and finish payment', async () => {
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
