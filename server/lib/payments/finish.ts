import { editPayment } from 'lib/payments/edit';
import { getPayment } from 'lib/payments/get';
import { verifyJWT } from 'lib/jwt/verify';
import { editUser } from 'lib/users/edit';
import { getUser } from 'lib/users/get';
import * as moment from 'moment';
import { TIERS } from 'constants/tiers';
import { Ptorx } from 'types/ptorx';

export async function finishPayment(
  jwt: string,
  userId: number
): Promise<void> {
  // Validate JWT and payment
  const { id, paid }: Partial<Ptorx.Payment> = await verifyJWT(jwt);
  if (!paid) throw 'Payment was not paid';
  const payment = await getPayment(id, userId);
  if (payment.paid) throw 'Payment has already been paid';

  // Update user
  const user = await getUser(userId);
  await editUser({
    ...user,
    tier: payment.tier,
    credits: TIERS.find(t => t.name == payment.tier).credits,
    tierExpiration: moment()
      .add(1, payment.duration as 'year' | 'month')
      .unix()
  });

  // Mark payment as paid
  await editPayment({ ...payment, paid }, userId);
}
