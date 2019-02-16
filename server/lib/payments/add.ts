import { editPayment } from 'lib/payments/edit';
import { getPayment } from 'lib/payments/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function addPayment(
  payment: Partial<Ptorx.Payment>,
  userId: number
): Promise<Ptorx.Payment> {
  const db = new MySQL();
  try {
    const insert: Partial<Ptorx.Payment> = { userId };
    const result = await db.query('INSERT INTO payments SET ?', insert);
    if (!result.affectedRows) throw 'Could not add payment';

    const _payment = await getPayment(result.insertId, userId);
    db.release();
    return editPayment({ ..._payment, ...payment }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
