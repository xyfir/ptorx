import { addPrimaryEmail } from 'lib/primary-emails/add';
import { captureMail } from 'lib/tests/capture-mail';

test('addPrimaryEmail()', async () => {
  expect.assertions(13);

  const promise = captureMail(1, message => {
    expect(message.subject).toBe('Verify your email for Ptorx');
    expect(message.from.text).toBe(`noreply-x@${process.enve.DOMAIN}`);
    expect(message.to.text).toBe('test@example.com');
    expect(message.html).toMatch(/Verify Primary Email/);
    expect(message.text).toMatch(/Verify Primary Email/);
  });

  const primaryEmail = await addPrimaryEmail(
    { address: 'test@example.com' },
    1234
  );
  expect(Object.keys(primaryEmail).length).toBe(7);
  expect(primaryEmail.id).toBeNumber();
  expect(primaryEmail.created).toBeNumber();
  expect(primaryEmail.userId).toBe(1234);
  expect(primaryEmail.address).toBe('test@example.com');
  expect(primaryEmail.verified).toBeFalse();
  expect(primaryEmail.key).toHaveLength(36);
  expect(primaryEmail.autolink).toBeFalse();

  await promise;
});
