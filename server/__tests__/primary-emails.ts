import { deletePrimaryEmail } from 'lib/primary-emails/delete';
import { listPrimaryEmails } from 'lib/primary-emails/list';
import { addPrimaryEmail } from 'lib/primary-emails/add';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('create primary email', async () => {
  const primaryEmail = await addPrimaryEmail(
    { address: 'test@example.com' },
    1234
  );
  expect(Object.keys(primaryEmail).length).toBe(4);
  expect(primaryEmail.primaryEmailId).toBeNumber();
  expect(primaryEmail.created).toBeNumber();
  expect(primaryEmail.userId).toBe(1234);
  const _primaryEmail: Ptorx.PrimaryEmail = {
    ...primaryEmail,
    address: 'test@example.com'
  };
  expect(primaryEmail).toMatchObject(_primaryEmail);
});

test('list primary emails', async () => {
  const primaryEmails = await listPrimaryEmails(1234);
  expect(primaryEmails).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.PrimaryEmailList[0]> = [
    'primaryEmailId',
    'userId',
    'address',
    'created'
  ];
  expect(primaryEmails[0]).toContainAllKeys(keys);
});

test('delete primary emails', async () => {
  let primaryEmails = await listPrimaryEmails(1234);
  const [primaryEmail] = primaryEmails;
  await deletePrimaryEmail(primaryEmail.primaryEmailId, 1234);
  primaryEmails = await listPrimaryEmails(1234);
  expect(primaryEmails).toBeArrayOfSize(0);
  expect(
    primaryEmails.find(m => m.primaryEmailId == primaryEmail.primaryEmailId)
  ).toBeUndefined();
});
