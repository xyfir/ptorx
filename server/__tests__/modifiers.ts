import { deleteModifier } from 'lib/modifiers/delete';
import { listModifiers } from 'lib/modifiers/list';
import { addModifier } from 'lib/modifiers/add';
import { Ptorx } from 'typings/ptorx';
import 'lib/tests/prepare';

test('create modifier: text-only', async () => {
  const modifier = await addModifier({ type: 'text-only', name: 'name' }, 1234);
  expect(Object.keys(modifier).length).toBe(17);
  expect(modifier.id).toBeNumber();
  expect(modifier.created).toBeNumber();
  expect(modifier.userId).toBe(1234);
  const _modifier: Ptorx.Modifier = {
    ...modifier,
    name: 'name',
    type: 'text-only',
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
    template: null
  };
  expect(modifier).toMatchObject(_modifier);
});

test('create modifier: replace', async () => {
  const modifier = await addModifier(
    {
      type: 'replace',
      replacement: 'Bye',
      regex: false,
      flags: '',
      find: 'Hello'
    },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    ...modifier,
    name: '',
    type: 'replace',
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
    template: null
  };
  expect(modifier).toMatchObject(_modifier);
});

test('create modifier: subject', async () => {
  const modifier = await addModifier(
    { type: 'subject', subject: 'subject' },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    ...modifier,
    name: '',
    type: 'subject',
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
    template: null
  };
  expect(modifier).toMatchObject(_modifier);
});

test('create modifier: tag', async () => {
  const modifier = await addModifier(
    { type: 'tag', prepend: true, tag: 'tag' },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    ...modifier,
    name: '',
    type: 'tag',
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
    template: null
  };
  expect(modifier).toMatchObject(_modifier);
});

test('create modifier: concat', async () => {
  const modifier = await addModifier(
    {
      type: 'concat',
      add: 'from',
      to: 'subject',
      separator: ':',
      prepend: true
    },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    ...modifier,
    name: '',
    type: 'concat',
    subject: null,
    replacement: null,
    flags: null,
    regex: null,
    prepend: true,
    target: null,
    add: 'from',
    to: 'subject',
    separator: ':',
    find: null,
    tag: null,
    template: null
  };
  expect(modifier).toMatchObject(_modifier);
});

test('create modifier: builder', async () => {
  const modifier = await addModifier(
    { type: 'builder', target: 'subject', template: 'Hello {{senderName}}' },
    1234
  );
  const _modifier: Ptorx.Modifier = {
    ...modifier,
    name: '',
    type: 'builder',
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
    template: 'Hello {{senderName}}'
  };
  expect(modifier).toMatchObject(_modifier);
});

test('list modifiers', async () => {
  const modifiers = await listModifiers(1234);
  expect(modifiers).toBeArrayOfSize(7);
  const keys: Array<keyof Ptorx.ModifierList[0]> = [
    'id',
    'userId',
    'name',
    'type',
    'created',
    'global'
  ];
  expect(modifiers[0]).toContainAllKeys(keys);
});

test('delete modifier', async () => {
  let modifiers = await listModifiers(1234);
  const modifier = modifiers.find(m => !m.global);
  await deleteModifier(modifier.id, 1234);
  modifiers = await listModifiers(1234);
  expect(modifiers).toBeArrayOfSize(6);
  expect(modifiers.find(m => m.id == modifier.id)).toBeUndefined();
});
