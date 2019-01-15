import { deleteProxyEmail } from 'lib/proxy-emails/delete';
import { listProxyEmails } from 'lib/proxy-emails/list';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';
import 'lib/tests/prepare';

test('create custom proxy email', async () => {
  const proxyEmail = await addProxyEmail(
    { address: 'test', domainId: 1, name: 'name' },
    1234
  );
  expect(Object.keys(proxyEmail).length).toBe(10);
  expect(proxyEmail.proxyEmailId).toBeNumber();
  expect(proxyEmail.created).toBeNumber();
  expect(proxyEmail.userId).toBe(1234);
  const _proxyEmail: Ptorx.ProxyEmail = {
    ...proxyEmail,
    name: 'name',
    address: 'test',
    domainId: 1,
    directForward: false,
    saveMail: false,
    spamFilter: false
  };
  expect(proxyEmail).toMatchObject(_proxyEmail);
});

test('create random proxy email', async () => {
  const proxyEmail = await addProxyEmail(
    {
      address: '',
      name: '',
      domainId: 1,
      directForward: true,
      saveMail: true,
      spamFilter: true
    },
    1234
  );
  expect(proxyEmail.address).toMatch(/^[a-z0-9]{1,64}$/);
  const _proxyEmail: Ptorx.ProxyEmail = {
    ...proxyEmail,
    name: '',
    domainId: 1,
    directForward: true,
    saveMail: true,
    spamFilter: true
  };
  expect(proxyEmail).toMatchObject(_proxyEmail);
});

test('list proxy emails', async () => {
  const proxyEmails = await listProxyEmails(1234);
  expect(proxyEmails).toBeArrayOfSize(2);
  const keys: Array<keyof Ptorx.ProxyEmailList[0]> = [
    'address',
    'created',
    'proxyEmailId',
    'name'
  ];
  expect(proxyEmails[0]).toContainAllKeys(keys);
});

test('delete proxy email', async () => {
  let proxyEmails = await listProxyEmails(1234);
  const [proxyEmail] = proxyEmails;
  await deleteProxyEmail(proxyEmail.proxyEmailId, 1234);
  proxyEmails = await listProxyEmails(1234);
  expect(proxyEmails).toBeArrayOfSize(1);
  expect(
    proxyEmails.find(e => e.proxyEmailId == proxyEmail.proxyEmailId)
  ).toBeUndefined();

  // Fully delete proxy emails
  const db = new MySQL();
  await db.query('DELETE FROM proxy_emails ORDER BY created DESC LIMIT 2');
  db.release();
});
