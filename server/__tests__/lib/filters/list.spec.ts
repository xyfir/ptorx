import { listFilters } from 'lib/filters/list';
import { addFilter } from 'lib/filters/add';
import { Ptorx } from 'types/ptorx';

test('listFilters()', async () => {
  await addFilter({ type: 'subject', name: 'name' }, 1234);
  const filters = await listFilters(1234);
  const keys: Array<keyof Ptorx.FilterList[0]> = [
    'id',
    'name',
    'type',
    'created'
  ];
  expect(filters[0]).toContainAllKeys(keys);
});
