import { getRecipient } from 'lib/mail/get-recipient';
import { addMessage } from 'lib/messages/add';
import { addAlias } from 'lib/aliases/add';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import { SRS } from 'sender-rewriting-scheme';

test('getRecipient() non-ptorx email', async () => {
  const recipient = await getRecipient('test@gmail.com');
  const _recipient: Ptorx.Recipient = { address: 'test@gmail.com' };
  expect(recipient).toMatchObject(_recipient);
});

test('getRecipient() alias', async () => {
  const alias = await addAlias(
    {
      domainId: process.enve.DOMAIN_ID,
      address: 'recipient'
    },
    1234
  );
  const user = await getUser(1234);
  const recipient = await getRecipient(`recipient@${process.enve.DOMAIN}`);
  const _recipient: Ptorx.Recipient = {
    user,
    address: `recipient@${process.enve.DOMAIN}`,
    domainId: process.enve.DOMAIN_ID,
    aliasId: alias.id
  };
  expect(recipient).toMatchObject(_recipient);
});

test('getRecipient() bad address on alias domain', async () => {
  const recipient = await getRecipient(`doesnotexist@${process.enve.DOMAIN}`);
  const _recipient: Ptorx.Recipient = {
    address: `doesnotexist@${process.enve.DOMAIN}`
  };
  expect(recipient).toMatchObject(_recipient);
});

test('getRecipient() reply to message', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const message = await addMessage({ aliasId: alias.id }, 1234);
  const user = await getUser(1234);
  const recipient = await getRecipient(message.ptorxReplyTo);
  const _recipient: Ptorx.Recipient = {
    user,
    message,
    address: message.ptorxReplyTo
  };
  expect(recipient).toMatchObject(_recipient);
});

test('getRecipient() srs', async () => {
  const srs = new SRS({ secret: process.enve.SRS_KEY });
  const forwarded = srs.forward('test@gmail.com', 'ptorx.com');
  const recipient = await getRecipient(forwarded);
  const _recipient: Ptorx.Recipient = {
    address: forwarded,
    bounceTo: 'test@gmail.com'
  };
  expect(recipient).toMatchObject(_recipient);
});

test('getRecipient() bad srs', async () => {
  const recipient = await getRecipient('SRS0=ABCD=AB=gmail.com=test@ptorx.com');
  const _recipient: Ptorx.Recipient = {
    address: 'SRS0=ABCD=AB=gmail.com=test@ptorx.com'
  };
  expect(recipient).toMatchObject(_recipient);
});
