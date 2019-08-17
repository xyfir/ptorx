import { deleteFilter } from 'lib/filters/delete';
import { listFilters } from 'lib/filters/list';
import { addFilter } from 'lib/filters/add';

test('deleteFilter()', async () => {
  const filter = await addFilter({ type: 'subject', name: 'name' }, 1234);
  await deleteFilter(filter.id, 1234);
  const filters = await listFilters(1234);
  expect(filters.find(m => m.id == filter.id)).toBeUndefined();
});
