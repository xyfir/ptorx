import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getPayment(
  paymentId: Ptorx.Payment['id'],
  userId: number
): Promise<Ptorx.Payment> {
  const db = new MySQL();
  try {
    const [payment]: Ptorx.Payment[] = await db.query(
      'SELECT * FROM payments WHERE id = ? AND userId = ?',
      [paymentId, userId]
    );
    db.release();
    if (!payment) throw 'Could not find payment';
    return payment;
  } catch (err) {
    db.release();
    throw err;
  }
}
