import { deletePrimaryEmail } from 'lib/primary-emails/delete';
import { listPrimaryEmails } from 'lib/primary-emails/list';
import { addPrimaryEmail } from 'lib/primary-emails/add';

test('delete primary emails', async () => {
  const primaryEmail = await addPrimaryEmail(
    { address: 'test@example.com' },
    1234,
    true
  );
  let primaryEmails = await listPrimaryEmails(1234);
  await deletePrimaryEmail(primaryEmail.id, 1234);
  primaryEmails = await listPrimaryEmails(1234);
  expect(primaryEmails.find(m => m.id == primaryEmail.id)).toBeUndefined();
});
