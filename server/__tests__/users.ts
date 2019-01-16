import { chargeUser } from 'lib/users/charge';
import 'lib/tests/prepare';

test('charge user', async () => {
  expect(await chargeUser(1234, 3)).toBe(2);
  expect(chargeUser(1234, 3)).toReject();
});
