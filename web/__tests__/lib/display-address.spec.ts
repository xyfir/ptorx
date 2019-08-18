import { displayAddress } from 'lib/display-address';

test('displayAddress()', () => {
  expect(displayAddress('Lorem Ipsum <lorem@ipsum.com>')).toBe('Lorem Ipsum');
  expect(
    displayAddress('Bob <bob@example.com>, Alice <alice@example.com>')
  ).toBe('Bob, +1');
});
