import { verifyPrimaryEmail } from 'lib/primary-emails/verify';
import { editPrimaryEmail } from 'lib/primary-emails/edit';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import { addPrimaryEmail } from 'lib/primary-emails/add';

test('verifyPrimaryEmail()', async () => {
  let primaryEmail = await addPrimaryEmail(
    { address: 'test@example.com' },
    1234,
    true
  );
  primaryEmail = await editPrimaryEmail(
    { ...primaryEmail, verified: false },
    1234
  );
  await expect(verifyPrimaryEmail(primaryEmail.id, 'nope', 1234)).toReject();
  await expect(
    verifyPrimaryEmail(primaryEmail.id, primaryEmail.key, 1234)
  ).not.toReject();
  const _primaryEmail = await getPrimaryEmail(primaryEmail.id, 1234);
  await expect(_primaryEmail.verified).toBeTrue();
});
