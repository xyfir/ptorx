import { addModifier } from 'lib/modifiers/add';
import { editAlias } from 'lib/aliases/edit';
import { addFilter } from 'lib/filters/add';
import { addAlias } from 'lib/aliases/add';
import { Ptorx } from 'types/ptorx';

test('editAlias()', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
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
