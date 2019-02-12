import { chargeUser } from 'lib/users/charge';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import 'lib/tests/prepare';

test('get user', async () => {
  const userId = Date.now();
  const _user: Ptorx.User = { credits: 100, email: 'test@example.com', userId };
  let user = await getUser({ userId, email: 'test@example.com' });
  expect(user).toMatchObject(_user);
  user = await getUser(userId);
  expect(user).toMatchObject(_user);
});

test('charge user', async () => {
  const userId = Date.now();
  const _user: Ptorx.User = { credits: 100, email: 'test@example.com', userId };
  let user = await getUser({ userId, email: 'test@example.com' });

  await chargeUser(userId, 3);
  user = await getUser(userId);
  expect(user.credits).toBe(97);
  await chargeUser(userId, 100);
  user = await getUser(userId);
  expect(user.credits).toBe(0);
});
