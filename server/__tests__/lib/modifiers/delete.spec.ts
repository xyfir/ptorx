import { deleteModifier } from 'lib/modifiers/delete';
import { listModifiers } from 'lib/modifiers/list';
import { addModifier } from 'lib/modifiers/add';

test('deleteModifier()', async () => {
  const modifier = await addModifier({ name: 'name', template: 'test' }, 1234);
  await deleteModifier(modifier.id, 1234);
  const modifiers = await listModifiers(1234);
  expect(modifiers.find(m => m.id == modifier.id)).toBeUndefined();
});
