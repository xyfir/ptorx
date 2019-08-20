import { addFilter } from 'lib/filters/add';
import { Ptorx } from 'types/ptorx';

test('addFilter() subject', async () => {
  const filter = await addFilter({ type: 'subject', name: 'name' }, 1234);
  expect(Object.keys(filter).length).toBe(8);
  expect(filter.id).toBeNumber();
  expect(filter.created).toBeNumber();
  expect(filter.userId).toBe(1234);
  const _filter: Ptorx.Filter = {
    ...filter,
    name: 'name',
    type: 'subject',
    find: '',
    blacklist: false,
    regex: false
  };
  expect(filter).toMatchObject(_filter);
});

test('addFilter() address', async () => {
  const filter = await addFilter(
    { type: 'address', find: 'find', blacklist: true, regex: true },
    1234
  );
  const _filter: Ptorx.Filter = {
    ...filter,
    name: 'Untitled Filter',
    type: 'address',
    find: 'find',
    blacklist: true,
    regex: true
  };
  expect(filter).toMatchObject(_filter);
});
