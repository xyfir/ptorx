import { addPayment } from 'lib/payments/add';
import { signJWT } from 'lib/jwt/sign';
import { Ptorx } from 'types/ptorx';

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
  return { url: `${process.enve.RICH_COW_WEB_URL}?jwt=${jwt}` };
}
