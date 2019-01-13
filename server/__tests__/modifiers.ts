import { deleteModifier } from 'lib/modifiers/delete';
import { addModifier } from 'lib/modifiers/add';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

// ** list
// ** delete

test('create modifier 2', async () => {
  const modifier = await addModifier({ type: 2, name: 'name' }, 1234);
  expect(Object.keys(modifier).length).toBe(17);
  expect(modifier.modifierId).toBeNumber();
  expect(modifier.created).toBeNumber();
  const _modifier: Ptorx.Modifier = {
    modifierId: modifier.modifierId,
    name: 'name',
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

test('create modifier 3', async () => {
  const modifier = await addModifier(
    { type: 3, replacement: 'Bye', regex: false, flags: '', find: 'Hello' },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    modifierId: modifier.modifierId,
    name: '',
    type: 3,
    subject: null,
    replacement: 'Bye',
    flags: '',
    regex: false,
    prepend: null,
    target: null,
    add: null,
    to: null,
    separator: null,
    find: 'Hello',
    tag: null,
    template: null,
    created: modifier.created
  };
  expect(modifier).toMatchObject(_modifier);
});

test('create modifier 4', async () => {
  const modifier = await addModifier({ type: 4, subject: 'subject' }, 1234);
  const _modifier: Ptorx.Modifier = {
    modifierId: modifier.modifierId,
    name: '',
    type: 4,
    subject: 'subject',
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

test('create modifier 5', async () => {
  const modifier = await addModifier(
    { type: 5, prepend: true, tag: 'tag' },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    modifierId: modifier.modifierId,
    name: '',
    type: 5,
    subject: null,
    replacement: null,
    flags: null,
    regex: null,
    prepend: true,
    target: null,
    add: null,
    to: null,
    separator: null,
    find: null,
    tag: 'tag',
    template: null,
    created: modifier.created
  };
  expect(modifier).toMatchObject(_modifier);
});

test('create modifier 6', async () => {
  const modifier = await addModifier(
    { type: 6, add: 'domain', to: 'subject', separator: ':', prepend: true },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    modifierId: modifier.modifierId,
    name: '',
    type: 6,
    subject: null,
    replacement: null,
    flags: null,
    regex: null,
    prepend: true,
    target: null,
    add: 'domain',
    to: 'subject',
    separator: ':',
    find: null,
    tag: null,
    template: null,
    created: modifier.created
  };
  expect(modifier).toMatchObject(_modifier);
});

test('create modifier 8', async () => {
  const modifier = await addModifier(
    { type: 8, target: 'subject', template: 'Hello {{senderName}}' },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    modifierId: modifier.modifierId,
    name: '',
    type: 8,
    subject: null,
    replacement: null,
    flags: null,
    regex: null,
    prepend: null,
    target: 'subject',
    add: null,
    to: null,
    separator: null,
    find: null,
    tag: null,
    template: 'Hello {{senderName}}',
    created: modifier.created
  };
  expect(modifier).toMatchObject(_modifier);
});
