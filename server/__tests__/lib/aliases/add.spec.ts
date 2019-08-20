import { addAlias } from 'lib/aliases/add';
import { Ptorx } from 'types/ptorx';

test('addAlias() custom', async () => {
  const alias = await addAlias(
    {
      domainId: process.enve.DOMAIN_ID,
      address: 'test',
      name: 'name'
    },
    1234
  );
  expect(Object.keys(alias).length).toBe(11);
  expect(alias.id).toBeNumber();
  expect(alias.created).toBeNumber();
  expect(alias.userId).toBe(1234);
  expect(alias.smtpKey).toBeString();
  expect(alias.smtpKey).toHaveLength(36);
  const _alias: Ptorx.Alias = {
    ...alias,
    name: 'name',
    address: 'test',
    domainId: process.enve.DOMAIN_ID,
    saveMail: false,
    canReply: false,
    links: [],
    fullAddress: `test@${process.enve.DOMAIN}`
  };
  expect(alias).toMatchObject(_alias);
});

test('addAlias() random', async () => {
  const alias = await addAlias(
    {
      domainId: process.enve.DOMAIN_ID,
      saveMail: true,
      canReply: true
    },
    1234
  );
  expect(alias.address).toMatch(/^[a-z0-9]{1,64}$/);
  const _alias: Ptorx.Alias = {
    ...alias,
    name: 'Untitled Alias',
    domainId: process.enve.DOMAIN_ID,
    saveMail: true,
    canReply: true
  };
  expect(alias).toMatchObject(_alias);
});
