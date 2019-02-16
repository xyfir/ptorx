import { chargeCredits } from 'lib/users/charge';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import 'lib/tests/prepare';

test('get user', async () => {
  const userId = Date.now();
  const _user: Ptorx.User = {
    credits: 100,
    email: 'test@example.com',
    userId,
    tier: 'basic',
    tierExpiration: null
  };
  let user = await getUser({ userId, email: 'test@example.com' });
  expect(user).toMatchObject(_user);
  user = await getUser(userId);
  expect(user).toMatchObject(_user);
});

test('charge credits', async () => {
  const userId = Date.now();
  let user = await getUser({ userId, email: 'test@example.com' });
  await chargeCredits(userId, 3);
  user = await getUser(userId);
  expect(user.credits).toBe(97);
  await chargeCredits(userId, 100);
  user = await getUser(userId);
  expect(user.credits).toBe(0);
});
