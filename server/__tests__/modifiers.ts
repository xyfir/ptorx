import 'lib/tests/prepare';
import { deleteModifier } from 'lib/modifiers/delete';
import { listModifiers } from 'lib/modifiers/list';
import { addModifier } from 'lib/modifiers/add';
import { Ptorx } from 'types/ptorx';

test('create modifier', async () => {
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

test('list modifiers', async () => {
  const modifiers = await listModifiers(1234);
  expect(modifiers).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.ModifierList[0]> = [
    'id',
    'userId',
    'name',
    'created'
  ];
  expect(modifiers[0]).toContainAllKeys(keys);
});

test('delete modifier', async () => {
  const [modifier] = await listModifiers(1234);
  await deleteModifier(modifier.id, 1234);
  const modifiers = await listModifiers(1234);
  expect(modifiers).toBeArrayOfSize(0);
});
