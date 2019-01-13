import { deleteModifier } from 'lib/modifiers/delete';
import { editModifier } from 'lib/modifiers/edit';
import { getModifier } from 'lib/modifiers/get';
import { addModifier } from 'lib/modifiers/add';

it('addModifier()', async () => {
  const modifier = await addModifier({ type: 2 }, 1);
  expect(typeof modifier).toBe('object');
});
