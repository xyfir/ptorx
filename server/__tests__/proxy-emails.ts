import { deleteProxyEmail } from 'lib/proxy-emails/delete';
import { addPrimaryEmail } from 'lib/primary-emails/add';
import { listProxyEmails } from 'lib/proxy-emails/list';
import { editProxyEmail } from 'lib/proxy-emails/edit';
import { addProxyEmail } from 'lib/proxy-emails/add';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { addModifier } from 'lib/modifiers/add';
import { addFilter } from 'lib/filters/add';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('create custom proxy email', async () => {
  const proxyEmail = await addProxyEmail(
    { address: 'test', domainId: 1, name: 'name' },
    1234
  );
  expect(Object.keys(proxyEmail).length).toBe(9);
  expect(proxyEmail.id).toBeNumber();
  expect(proxyEmail.created).toBeNumber();
  expect(proxyEmail.userId).toBe(1234);
  const _proxyEmail: Ptorx.ProxyEmail = {
    ...proxyEmail,
    name: 'name',
    address: 'test',
    domainId: 1,
    directForward: false,
    saveMail: false,
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
      saveMail: true
    },
    1234
  );
  expect(proxyEmail.address).toMatch(/^[a-z0-9]{1,64}$/);
  const _proxyEmail: Ptorx.ProxyEmail = {
    ...proxyEmail,
    name: '',
    domainId: 1,
    directForward: true,
    saveMail: true
  };
  expect(proxyEmail).toMatchObject(_proxyEmail);
});

test('list proxy emails', async () => {
  const proxyEmails = await listProxyEmails(1234);
  expect(proxyEmails).toBeArrayOfSize(2);
  const keys: Array<keyof Ptorx.ProxyEmailList[0]> = [
    'address',
    'created',
    'id',
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
  const proxyEmail = await getProxyEmail(proxyEmails[0].id, 1234);
  const modifier = await addModifier({ type: 'text-only', name: 'name' }, 1234);
  const filter = await addFilter({ type: 'subject', name: 'name' }, 1234);

  const _proxyEmail = await editProxyEmail(
    {
      ...proxyEmail,
      links: [
        {
          orderIndex: 1,
          proxyEmailId: proxyEmail.id,
          filterId: filter.id
        },
        {
          orderIndex: 2,
          proxyEmailId: proxyEmail.id,
          modifierId: modifier.id
        },
        {
          orderIndex: 3,
          proxyEmailId: proxyEmail.id,
          primaryEmailId: primaryEmail.id
        }
      ]
    },
    1234
  );
  const links: Ptorx.ProxyEmailLink[] = [
    {
      orderIndex: 1,
      proxyEmailId: proxyEmail.id,
      filterId: filter.id,
      modifierId: null,
      primaryEmailId: null
    },
    {
      orderIndex: 2,
      proxyEmailId: proxyEmail.id,
      modifierId: modifier.id,
      filterId: null,
      primaryEmailId: null
    },
    {
      orderIndex: 3,
      proxyEmailId: proxyEmail.id,
      primaryEmailId: primaryEmail.id,
      filterId: null,
      modifierId: null
    }
  ];
  expect(_proxyEmail.links).toMatchObject(links);
});

test('delete proxy email', async () => {
  let proxyEmails = await listProxyEmails(1234);
  const [proxyEmail] = proxyEmails;
  await deleteProxyEmail(proxyEmail.id, 1234);
  proxyEmails = await listProxyEmails(1234);
  expect(proxyEmails).toBeArrayOfSize(1);
  expect(proxyEmails.find(e => e.id == proxyEmail.id)).toBeUndefined();
});
