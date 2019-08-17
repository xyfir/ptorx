import { editPrimaryEmail } from 'lib/primary-emails/edit';
import { addPrimaryEmail } from 'lib/primary-emails/add';

test('editPrimaryEmail()', async () => {
  const primaryEmail = await addPrimaryEmail(
    { address: 'test@example.com' },
    1234,
    true
  );
  const _primaryEmail = await editPrimaryEmail(
    { ...primaryEmail, autolink: true },
    1234
  );
  expect(_primaryEmail.autolink).toBeTrue();
});
