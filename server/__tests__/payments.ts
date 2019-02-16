import { addPayment } from 'lib/payments/add';
import { Ptorx } from 'types/ptorx';
import 'lib/tests/prepare';

test('create payment', async () => {
  const paid = Date.now();
  const payment = await addPayment({ months: 1, tier: 'premium', paid }, 1234);
  expect(Object.keys(payment).length).toBe(5);
  expect(payment.id).toBeNumber();
  expect(payment.userId).toBe(1234);
  const _payment: Ptorx.Payment = {
    ...payment,
    months: 1,
    tier: 'premium',
    paid
  };
  expect(payment).toMatchObject(_payment);
});
