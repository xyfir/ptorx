import { verifyJWT, signJWT } from 'lib/jwt';
import { editPayment } from 'lib/payments/edit';
import { getPayment } from 'lib/payments/get';
import { addPayment } from 'lib/payments/add';
import { editUser } from 'lib/users/edit';
import { getUser } from 'lib/users/get';
import * as moment from 'moment';
import { TIERS } from 'lib/users/tiers';
import { Ptorx } from 'types/ptorx';

export async function finishPayment(
  jwt: string,
  userId: number
): Promise<void> {
  // Validate JWT and payment
  const { id, paid }: Partial<Ptorx.Payment> = await verifyJWT(jwt);
  if (!paid) throw 'Payment was not paid';
  const payment = await getPayment(id as Ptorx.Payment['id'], userId);
  if (payment.paid) throw 'Payment has already been paid';

  const tier = TIERS.find(t => t.name == payment.tier);
  if (!tier) throw 'Invalid tier';

  // Update user
  const user = await getUser(userId);
  await editUser({
    ...user,
    tier: payment.tier,
    credits: tier.credits,
    tierExpiration: moment()
      .add(1, payment.duration as 'year' | 'month')
      .unix()
  });

  // Mark payment as paid
  await editPayment({ ...payment, paid }, userId);
}

export async function startPayment(
  payment: Partial<Ptorx.Payment>,
  userId: number
): Promise<{ url: string }> {
  const _payment = await addPayment(payment, userId);
  const jwt = await signJWT(
    {
      id: _payment.id,
      amount: _payment.amount,
      methods: ['coinbase-commerce', 'square']
    },
    '1d'
  );

  return { url: `${process.enve.CCASHCOW_WEB_URL}?jwt=${jwt}` };
}
