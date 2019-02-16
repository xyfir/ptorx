import { getPayment } from 'lib/payments/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editPayment(
  payment: Ptorx.Payment,
  userId: number
): Promise<Ptorx.Payment> {
  const db = new MySQL();
  try {
    const result = await db.query(
      `
        UPDATE payments SET tier = ?, months = ?, paid = ?
        WHERE id = ? AND userId = ?
      `,
      [payment.tier, payment.months, payment.paid, payment.id, userId]
    );
    if (!result.affectedRows) throw 'Could not edit payment';

    db.release();
    return await getPayment(payment.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
