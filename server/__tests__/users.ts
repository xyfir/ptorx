import 'lib/tests/prepare';
import { chargeCredits } from 'lib/users/charge';
import { setPGPKeys } from 'lib/users/set-keys';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';

test('get user', async () => {
  const userId = Date.now();
  const _user: Ptorx.User = {
    credits: 100,
    email: 'test@example.com',
    userId,
    tier: 'basic',
    tierExpiration: null,
    privateKey: null,
    publicKey: null
  };
  let user = await getUser({ userId, email: 'test@example.com' });
  expect(user).toMatchObject(_user);
  user = await getUser(userId);
  expect(user).toMatchObject(_user);
});

test('charge credits', async () => {
  let user = await getUser({ userId: Date.now(), email: 'test@example.com' });
  user = await chargeCredits(user, 3);
  expect(user.credits).toBe(97);
  user = await chargeCredits(user, 100);
  expect(user.credits).toBe(0);
});

test('set pgp keys', async () => {
  let user = await getUser({ userId: Date.now(), email: 'test@example.com' });
  user = await setPGPKeys('abc', 'def', user.userId);
  expect(user.privateKey).toBe('abc');
  expect(user.publicKey).toBe('def');
  user = await setPGPKeys(null, null, user.userId);
  expect(user.privateKey).toBeNull();
  expect(user.publicKey).toBeNull();
});
