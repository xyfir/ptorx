import { chargeUser } from 'lib/users/charge';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('get user', async () => {
  const userId = Date.now();
  const _user: Ptorx.User = {
    credits: 100,
    email: 'test@example.com',
    emailTemplate: null,
    userId
  };
  let user = await getUser({ userId, email: 'test@example.com' });
  expect(user).toMatchObject(_user);
  user = await getUser({ userId, email: 'test@example.com' });
  expect(user).toMatchObject(_user);
});

test('charge user', async () => {
  expect(await chargeUser(1234, 3)).toBe(2);
  expect(chargeUser(1234, 3)).toReject();
});
