import { setPGPKeys } from 'lib/users/set-keys';
import { getUser } from 'lib/users/get';

test('setPGPKeys()', async () => {
  let user = await getUser({ userId: Date.now(), email: 'test@example.com' });
  user = await setPGPKeys('abc', 'def', user.userId);
  expect(user.privateKey).toBe('abc');
  expect(user.publicKey).toBe('def');
  user = await setPGPKeys(null, null, user.userId);
  expect(user.privateKey).toBeNull();
  expect(user.publicKey).toBeNull();
});
