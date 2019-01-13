import { deleteModifier } from 'lib/modifiers/delete';
import { addModifier } from 'lib/modifiers/add';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

// ** create for all types
// ** list
// ** delete

test('create modifier 2', async () => {
  const modifier = await addModifier({ type: 2 }, 1234);
  expect(Object.keys(modifier).length).toBe(17);
  expect(modifier.modifierId).toBeNumber();
  expect(modifier.created).toBeNumber();
  const _modifier: Ptorx.Modifier = {
    modifierId: modifier.modifierId,
    name: '',
    type: 2,
    subject: null,
    replacement: null,
    flags: null,
    regex: null,
    prepend: null,
    target: null,
    add: null,
    to: null,
    separator: null,
    find: null,
    tag: null,
    template: null,
    created: modifier.created
  };
  expect(modifier).toMatchObject(_modifier);
});
