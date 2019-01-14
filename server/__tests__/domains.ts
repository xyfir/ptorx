import { listDomainUsers } from 'lib/domains/users/list';
import { addDomainUser } from 'lib/domains/users/add';
import { verifyDomain } from 'lib/domains/verify';
import { deleteDomain } from 'lib/domains/delete';
import { listDomains } from 'lib/domains/list';
import { addDomain } from 'lib/domains/add';
import { getDomain } from 'lib/domains/get';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('create domain 1', async () => {
  const domain = await addDomain({ domain: 'example.com' }, 1234);
  expect(Object.keys(domain).length).toBe(8);
  expect(domain.id).toBeNumber();
  expect(domain.created).toBeNumber();
  expect(domain.userId).toBe(1234);
  const _domain: Ptorx.Domain = {
    ...domain,
    domain: 'example.com',
    domainKey: '',
    global: false,
    isCreator: true,
    verified: false
  };
  expect(domain).toMatchObject(_domain);
});

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

test('verify domain', async () => {
  const domains = await listDomains(1234);
  const domain = await domains.find(d => !d.global);
  await verifyDomain(domain.id, 1234);
  const _domain = await getDomain(domain.id, 1234);
  expect(_domain.verified).toBeTrue();
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
  expect(domainUsers).toBeArrayOfSize(2);
  const keys: Array<keyof Ptorx.DomainUserList[0]> = [
    'authorized',
    'created',
    'label',
    'requestKey'
  ];
  expect(domainUsers[0]).toContainAllKeys(keys);
  expect(domainUsers.find(u => u.authorized)).not.toBeUndefined();
  expect(domainUsers.find(u => !u.authorized)).not.toBeUndefined();
});

test('delete domain', async () => {
  let domains = await listDomains(1234);
  const domain = domains.find(d => !d.global);
  await deleteDomain(domain.id, 1234);
  domains = await listDomains(1234);
  expect(domains).toBeArrayOfSize(2);
  expect(domains.find(d => d.id == domain.id)).toBeUndefined();
});
