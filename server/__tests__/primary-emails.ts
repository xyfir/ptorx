import { verifyPrimaryEmail } from 'lib/primary-emails/verify';
import { deletePrimaryEmail } from 'lib/primary-emails/delete';
import { listPrimaryEmails } from 'lib/primary-emails/list';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import { addPrimaryEmail } from 'lib/primary-emails/add';
import { captureMail } from 'lib/tests/capture-mail';
import * as CONFIG from 'constants/config';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('create primary email', async () => {
  expect.assertions(12);

  captureMail(1, message => {
    expect(message.subject).toBe(`Verify your email for ${CONFIG.NAME}`);
    expect(message.from.text).toBe(`noreply--x@${CONFIG.DOMAIN}`);
    expect(message.to.text).toBe('test@example.com');
    expect(message.html).toMatch(/http.+Verify My Email/);
    expect(message.text).toMatch(/Verify My Email: http/);
  });

  const primaryEmail = await addPrimaryEmail(
    { address: 'test@example.com' },
    1234
  );
  expect(Object.keys(primaryEmail).length).toBe(6);
  expect(primaryEmail.id).toBeNumber();
  expect(primaryEmail.created).toBeNumber();
  expect(primaryEmail.userId).toBe(1234);
  expect(primaryEmail.address).toBe('test@example.com');
  expect(primaryEmail.verified).toBeFalse();
  expect(primaryEmail.key).toHaveLength(36);
});

test('list primary emails', async () => {
  const primaryEmails = await listPrimaryEmails(1234);
  expect(primaryEmails).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.PrimaryEmailList[0]> = [
    'id',
    'userId',
    'address',
    'created',
    'verified'
  ];
  expect(primaryEmails[0]).toContainAllKeys(keys);
});

test('verify primary email', async () => {
  const primaryEmails = await listPrimaryEmails(1234);
  const primaryEmail = await getPrimaryEmail(primaryEmails[0].id, 1234);
  await expect(verifyPrimaryEmail(primaryEmail.id, 'nope', 1234)).toReject();
  await expect(
    verifyPrimaryEmail(primaryEmail.id, primaryEmail.key, 1234)
  ).not.toReject();
  const _primaryEmail = await getPrimaryEmail(primaryEmail.id, 1234);
  await expect(_primaryEmail.verified).toBeTrue();
});

test('delete primary emails', async () => {
  let primaryEmails = await listPrimaryEmails(1234);
  const [primaryEmail] = primaryEmails;
  await deletePrimaryEmail(primaryEmail.id, 1234);
  primaryEmails = await listPrimaryEmails(1234);
  expect(primaryEmails).toBeArrayOfSize(0);
  expect(primaryEmails.find(m => m.id == primaryEmail.id)).toBeUndefined();
});
