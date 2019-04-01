import 'lib/tests/prepare';
import { deleteAlias } from 'lib/aliases/delete';
import { listAliases } from 'lib/aliases/list';
import { addModifier } from 'lib/modifiers/add';
import { editAlias } from 'lib/aliases/edit';
import { addFilter } from 'lib/filters/add';
import { addAlias } from 'lib/aliases/add';
import { getAlias } from 'lib/aliases/get';
import { Ptorx } from 'types/ptorx';

test('create custom alias', async () => {
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

test('create random alias', async () => {
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
    name: '',
    domainId: process.enve.DOMAIN_ID,
    saveMail: true,
    canReply: true
  };
  expect(alias).toMatchObject(_alias);
});

test('list aliases', async () => {
  const aliases = await listAliases(1234);
  expect(aliases).toBeArrayOfSize(2);
  const keys: Array<keyof Ptorx.AliasList[0]> = [
    'fullAddress',
    'created',
    'id',
    'name'
  ];
  expect(aliases[0]).toContainAllKeys(keys);
});

test('edit alias links', async () => {
  const aliases = await listAliases(1234);
  const alias = await getAlias(aliases[0].id, 1234);
  const modifier = await addModifier({ name: 'name' }, 1234);
  const filter = await addFilter({ type: 'subject', name: 'name' }, 1234);

  const _alias = await editAlias(
    {
      ...alias,
      links: [
        {
          orderIndex: 1,
          aliasId: alias.id,
          filterId: filter.id
        },
        {
          orderIndex: 2,
          aliasId: alias.id,
          modifierId: modifier.id
        }
      ]
    },
    1234
  );
  const links: Ptorx.AliasLink[] = [
    {
      orderIndex: 1,
      aliasId: alias.id,
      filterId: filter.id,
      modifierId: null,
      primaryEmailId: null
    },
    {
      orderIndex: 2,
      aliasId: alias.id,
      modifierId: modifier.id,
      filterId: null,
      primaryEmailId: null
    }
  ];
  expect(_alias.links).toMatchObject(links);
});

test('delete alias', async () => {
  let aliases = await listAliases(1234);
  const [alias] = aliases;
  await deleteAlias(alias.id, 1234);
  aliases = await listAliases(1234);
  expect(aliases).toBeArrayOfSize(1);
  expect(aliases.find(e => e.id == alias.id)).toBeUndefined();
});
