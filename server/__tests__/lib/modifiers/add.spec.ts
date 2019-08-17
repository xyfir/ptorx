import { addModifier } from 'lib/modifiers/add';
import { Ptorx } from 'types/ptorx';

test('addModifier()', async () => {
  const modifier = await addModifier({ name: 'name', template: 'test' }, 1234);
  expect(Object.keys(modifier).length).toBe(6);
  expect(modifier.id).toBeNumber();
  expect(modifier.created).toBeNumber();
  expect(modifier.userId).toBe(1234);
  const _modifier: Ptorx.Modifier = {
    ...modifier,
    name: 'name',
    target: 'subject',
    template: 'test'
  };
  expect(modifier).toMatchObject(_modifier);
});
