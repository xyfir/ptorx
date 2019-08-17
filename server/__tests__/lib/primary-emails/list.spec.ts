import { listPrimaryEmails } from 'lib/primary-emails/list';
import { addPrimaryEmail } from 'lib/primary-emails/add';
import { Ptorx } from 'types/ptorx';

test('listPrimaryEmails()', async () => {
  await addPrimaryEmail({ address: 'test@example.com' }, 1234, true);
  const primaryEmails = await listPrimaryEmails(1234);
  expect(primaryEmails).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.PrimaryEmailList[0]> = [
    'id',
    'userId',
    'address',
    'created',
    'verified',
    'autolink'
  ];
  expect(primaryEmails[0]).toContainAllKeys(keys);
});
