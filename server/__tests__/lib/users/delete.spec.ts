import { deleteUser } from 'lib/users/delete';
import { addAlias } from 'lib/aliases/add';
import { getUser } from 'lib/users/get';

test('deleteUser()', async () => {
  // Create new user
  const user = await getUser({ userId: Date.now(), email: 'test@example.com' });

  // Create random alias
  const alias = await addAlias(
    { domainId: process.enve.DOMAIN_ID },
    user.userId
  );

  // Delete user
  await deleteUser(user.userId);

  // Validate user has been deleted
  const _user = await getUser({
    userId: user.userId,
    email: 'test2@example.com'
  });
  expect(_user.email).toBe('test2@example.com');

  // Validate alias was marked as deleted
  await expect(
    addAlias(
      { domainId: process.enve.DOMAIN_ID, address: alias.address },
      _user.userId
    )
  ).rejects.toMatch('already in use');
});
