import { editPayment } from 'lib/payments/edit';
import { getPayment } from 'lib/payments/get';
import { verifyJWT } from 'lib/jwt/verify';
import * as moment from 'moment';
import { TIERS } from 'constants/tiers';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function finishPayment(
  jwt: string,
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    // Validate JWT and payment
    const { id, paid }: Partial<Ptorx.Payment> = await verifyJWT(jwt);
    if (!paid) throw 'Payment was not paid';
    const payment = await getPayment(id, userId);
    if (payment.paid) throw 'Payment has already been paid';

    // Update user
    await db.query(
      `
        UPDATE users SET credits = ?, tier = ?, tierExpiration = ?
        WHERE userId = ?
      `,
      [
        TIERS.find(t => t.name == payment.tier).credits,
        payment.tier,
        moment()
          .add(1, payment.duration as 'year' | 'month')
          .unix(),
        userId
      ]
    );

    // Mark payment as paid
    await editPayment({ ...payment, paid }, userId);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
