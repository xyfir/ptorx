import { addPayment } from 'lib/payments/add';
import { Ptorx } from 'types/ptorx';

test('addPayment()', async () => {
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
