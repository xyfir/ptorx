import { editFilter } from 'lib/filters/edit';
import { filterMail } from 'lib/mail/filter';
import { ParsedMail } from 'mailparser';
import { addFilter } from 'lib/filters/add';

test('filterMail()', async () => {
  const match: ParsedMail = {
    attachments: [],
    from: {
      html: '',
      text: 'match@example.com',
      value: []
    },
    headerLines: [{ key: 'Match', line: 'Match: Test' }],
    html: '<div>Match</div>',
    subject: 'Match',
    text: 'Match',
    to: {
      html: '',
      text: `match@${process.enve.DOMAIN}`,
      value: []
    },
    textAsHtml: '',
    headers: new Map()
  };
  const noMatch: ParsedMail = {
    attachments: [],
    from: {
      html: '',
      text: 'no@domain.com',
      value: []
    },
    headerLines: [{ key: 'No', line: 'No: Test' }],
    html: '<div>No</div>',
    subject: 'No',
    text: 'No',
    to: {
      html: '',
      text: `no@${process.enve.DOMAIN}`,
      value: []
    },
    textAsHtml: '',
    headers: new Map()
  };

  let filter = await addFilter({ type: 'subject', find: 'Match' }, 1234);
  expect(await filterMail(match, filter.id, 1234)).toBeTrue();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeFalse();

  filter = await editFilter(
    {
      ...filter,
      type: 'address',
      find: '^match@example\\.com$',
      regex: true,
      blacklist: true
    },
    1234
  );
  expect(await filterMail(match, filter.id, 1234)).toBeFalse();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeTrue();

  filter = await editFilter(
    {
      ...filter,
      type: 'text',
      find: 'Match',
      regex: false,
      blacklist: false
    },
    1234
  );
  expect(await filterMail(match, filter.id, 1234)).toBeTrue();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeFalse();

  filter = await editFilter(
    { ...filter, type: 'html', find: '<div>Match</div>' },
    1234
  );
  expect(await filterMail(match, filter.id, 1234)).toBeTrue();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeFalse();

  filter = await editFilter(
    { ...filter, type: 'header', find: 'Match: Test' },
    1234
  );
  expect(await filterMail(match, filter.id, 1234)).toBeTrue();
  expect(await filterMail(noMatch, filter.id, 1234)).toBeFalse();
});
