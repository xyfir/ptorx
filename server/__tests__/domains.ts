import { listDomainUsers } from 'lib/domains/users/list';
import { addDomainUser } from 'lib/domains/users/add';
import { getDomainAuth } from 'lib/domains/get';
import { verifyDomain } from 'lib/domains/verify';
import { deleteDomain } from 'lib/domains/delete';
import { listDomains } from 'lib/domains/list';
import { addDomain } from 'lib/domains/add';
import { Ptorx } from 'types/ptorx';

test('create domain', async () => {
  const domain = await addDomain({ domain: 'example.com' }, 1234);
  expect(Object.keys(domain).length).toBe(9);
  expect(domain.id).toBeNumber();
  expect(domain.created).toBeNumber();
  expect(domain.userId).toBe(1234);
  expect(domain.publicKey).toStartWith('v=DKIM1; k=rsa; p=');
  expect(domain.selector).toMatch(/^[a-z]{3,10}\d{2}$/);
  const _domain: Ptorx.Domain = {
    ...domain,
    domain: 'example.com',
    global: false,
    isCreator: true,
    verified: false
  };
  expect(domain).toMatchObject(_domain);
}, 15000);

test('list domains', async () => {
  const domains = await listDomains(1234);
  expect(domains).toBeArrayOfSize(3);
  const keys: Array<keyof Ptorx.DomainList[0]> = [
    'created',
    'domain',
    'global',
    'id',
    'isCreator'
  ];
  expect(domains[0]).toContainAllKeys(keys);
});

test('get domain auth', async () => {
  const [domain] = await listDomains(1234);
  const auth = await getDomainAuth(domain.id);
  const keys: Array<keyof Ptorx.DomainAuth> = [
    'domain',
    'privateKey',
    'publicKey',
    'selector'
  ];
  expect(auth).toContainAllKeys(keys);
  expect(auth.privateKey).toMatch(/RSA PRIVATE KEY/);
});

test('verify domain', async () => {
  const domains = await listDomains(1234);
  const domain = await domains.find(d => !d.global);
  await expect(verifyDomain(domain.id, 1234)).rejects.toBe(
    'Domain could not be verified'
  );
});

test('add domain user', async () => {
  const domainUser = await addDomainUser('example.com', 12345);
  expect(Object.keys(domainUser).length).toBe(6);
  expect(domainUser.created).toBeNumber();
  expect(domainUser.requestKey).toBeString();
  expect(domainUser.requestKey).toBeTruthy();
  const _domainUser: Ptorx.DomainUser = {
    ...domainUser,
    userId: 12345,
    label: '',
    authorized: false
  };
  expect(domainUser).toMatchObject(_domainUser);
});

test('list domain users', async () => {
  const domains = await listDomains(1234);
  const domain = await domains.find(d => !d.global);
  const domainUsers = await listDomainUsers(domain.id, 1234);
  expect(domainUsers).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.DomainUserList[0]> = [
    'authorized',
    'created',
    'label',
    'requestKey',
    'domainId'
  ];
  expect(domainUsers[0]).toContainAllKeys(keys);
});

test('delete domain', async () => {
  let domains = await listDomains(1234);
  const domain = domains.find(d => !d.global);
  await deleteDomain(domain.id, 1234);
  domains = await listDomains(1234);
  expect(domains).toBeArrayOfSize(2);
  expect(domains.find(d => d.id == domain.id)).toBeUndefined();
});
