import { deleteProxyEmail } from 'lib/proxy-emails/delete';
import { addPrimaryEmail } from 'lib/primary-emails/add';
import { listProxyEmails } from 'lib/proxy-emails/list';
import { editProxyEmail } from 'lib/proxy-emails/edit';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { addModifier } from 'lib/modifiers/add';
import { addFilter } from 'lib/filters/add';
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
    spamFilter: false,
    links: []
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

test('edit proxy email links', async () => {
  const primaryEmail = await addPrimaryEmail(
    { address: 'test@example.com' },
    1234
  );
  const proxyEmails = await listProxyEmails(1234);
  const proxyEmail = await getProxyEmail(proxyEmails[0].proxyEmailId, 1234);
  const modifier = await addModifier({ type: 2, name: 'name' }, 1234);
  const filter = await addFilter({ type: 1, name: 'name' }, 1234);

  const _proxyEmail = await editProxyEmail(
    {
      ...proxyEmail,
      links: [
        {
          orderIndex: 1,
          proxyEmailId: proxyEmail.proxyEmailId,
          filterId: filter.filterId
        },
        {
          orderIndex: 2,
          proxyEmailId: proxyEmail.proxyEmailId,
          modifierId: modifier.modifierId
        },
        {
          orderIndex: 3,
          proxyEmailId: proxyEmail.proxyEmailId,
          primaryEmailId: primaryEmail.primaryEmailId
        }
      ]
    },
    1234
  );
  const links: Ptorx.ProxyEmailLink[] = [
    {
      orderIndex: 1,
      proxyEmailId: proxyEmail.proxyEmailId,
      filterId: filter.filterId,
      modifierId: null,
      primaryEmailId: null
    },
    {
      orderIndex: 2,
      proxyEmailId: proxyEmail.proxyEmailId,
      modifierId: modifier.modifierId,
      filterId: null,
      primaryEmailId: null
    },
    {
      orderIndex: 3,
      proxyEmailId: proxyEmail.proxyEmailId,
      primaryEmailId: primaryEmail.primaryEmailId,
      filterId: null,
      modifierId: null
    }
  ];
  expect(_proxyEmail.links).toMatchObject(links);
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
