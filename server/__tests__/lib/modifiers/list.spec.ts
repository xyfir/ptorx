import { listModifiers } from 'lib/modifiers/list';
import { addModifier } from 'lib/modifiers/add';
import { Ptorx } from 'types/ptorx';

test('listModifiers()', async () => {
  await addModifier({ name: 'name', template: 'test' }, 1234);
  const modifiers = await listModifiers(1234);
  const keys: Array<keyof Ptorx.ModifierList[0]> = [
    'id',
    'userId',
    'name',
    'created'
  ];
  expect(modifiers[0]).toContainAllKeys(keys);
});
