import { getPayment } from 'lib/payments/get';
import { TIERS } from 'lib/users/tiers';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editPayment(
  payment: Ptorx.Payment,
  userId: number
): Promise<Ptorx.Payment> {
  const db = new MySQL();
  try {
    const tier = TIERS.find(t => t.name == payment.tier);
    if (!tier) throw 'Invalid tier';
    const duration = tier.durations.find(d => d.duration == payment.duration);
    if (!duration) throw 'Invalid tier duration';

    const result = await db.query(
      `
        UPDATE payments SET tier = ?, duration = ?, amount = ?, paid = ?
        WHERE id = ? AND userId = ?
      `,
      [
        payment.tier,
        payment.duration,
        duration.cost,
        payment.paid,
        payment.id,
        userId
      ]
    );
    if (!result.affectedRows) throw 'Could not edit payment';

    db.release();
    return await getPayment(payment.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
