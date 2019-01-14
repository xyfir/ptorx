import { deleteFilter } from 'lib/filters/delete';
import { listFilters } from 'lib/filters/list';
import { addFilter } from 'lib/filters/add';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('create filter 1', async () => {
  const filter = await addFilter({ type: 1, name: 'name' }, 1234);
  expect(Object.keys(filter).length).toBe(8);
  expect(filter.filterId).toBeNumber();
  expect(filter.created).toBeNumber();
  expect(filter.userId).toBe(1234);
  const _filter: Ptorx.Filter = {
    ...filter,
    name: 'name',
    type: 1,
    find: '',
    acceptOnMatch: false,
    regex: false
  };
  expect(filter).toMatchObject(_filter);
});

test('create filter 2', async () => {
  const filter = await addFilter(
    { type: 2, find: 'find', acceptOnMatch: true, regex: true },
    1234
  );
  const _filter: Ptorx.Filter = {
    ...filter,
    name: '',
    type: 2,
    find: 'find',
    acceptOnMatch: true,
    regex: true
  };
  expect(filter).toMatchObject(_filter);
});

test('list filters', async () => {
  const filters = await listFilters(1234);
  expect(filters).toBeArrayOfSize(2);
  expect(filters[0]).toContainAllKeys([
    'filterId',
    'name',
    'type',
    'created'
  ] as Array<keyof Ptorx.FilterList[0]>);
});

test('delete filter', async () => {
  let filters = await listFilters(1234);
  const [filter] = filters;
  await deleteFilter(filter.filterId, 1234);
  filters = await listFilters(1234);
  expect(filters).toBeArrayOfSize(1);
  expect(filters.find(m => m.filterId == filter.filterId)).toBeUndefined();
});
