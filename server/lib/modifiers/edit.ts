import { getModifier } from 'lib/modifiers/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editModifier(
  modifier: Ptorx.Modifier,
  userId: number
): Promise<Ptorx.Modifier> {
  const db = new MySQL();
  try {
    switch (modifier.type) {
      case 'text-only':
        break;
      case 'replace':
        if (
          typeof modifier.replacement != 'string' ||
          typeof modifier.regex != 'boolean' ||
          typeof modifier.flags != 'string' ||
          typeof modifier.find != 'string'
        )
          throw 'Missing find/replacement/regex/flags values';
        if (!/^[gimu]{0,4}$/.test(modifier.flags))
          throw 'Invalid regular expression flags';
        modifier.add = modifier.prepend = modifier.separator = modifier.subject = modifier.tag = modifier.target = modifier.template = modifier.to = null;
        break;
      case 'subject':
        if (typeof modifier.subject != 'string') throw 'Missing subject';
        modifier.add = modifier.find = modifier.flags = modifier.prepend = modifier.regex = modifier.replacement = modifier.separator = modifier.tag = modifier.target = modifier.template = modifier.to = null;
        break;
      case 'tag':
        if (
          typeof modifier.prepend != 'boolean' ||
          typeof modifier.tag != 'string'
        )
          throw 'Missing tag/prepend';
        modifier.add = modifier.find = modifier.flags = modifier.regex = modifier.replacement = modifier.separator = modifier.subject = modifier.target = modifier.template = modifier.to = null;
        break;
      case 'concat':
        if (modifier.add != 'subject' && modifier.add != 'from')
          throw 'Invalid "add" value';
        if (
          modifier.to != 'subject' &&
          modifier.to != 'html' &&
          modifier.to != 'text'
        )
          throw 'Invalid "to" value';
        if (typeof modifier.separator != 'string') throw 'Missing separator';
        if (typeof modifier.prepend != 'boolean') throw 'Missing prepend';
        modifier.find = modifier.flags = modifier.regex = modifier.replacement = modifier.subject = modifier.tag = modifier.target = modifier.template = null;
        break;
      case 'builder':
        if (
          modifier.target != 'text' &&
          modifier.target != 'html' &&
          modifier.target != 'subject'
        )
          throw 'Invalid "target" value';
        if (typeof modifier.template != 'string') throw 'Missing template';
        modifier.add = modifier.find = modifier.flags = modifier.prepend = modifier.regex = modifier.replacement = modifier.separator = modifier.subject = modifier.tag = modifier.to = null;
        break;
      default:
        throw 'Invalid type';
    }

    const result = await db.query(
      `
        UPDATE modifiers m
        SET
          m.name = ?, m.type = ?, m.subject = ?, m.replacement = ?, m.flags = ?,
          m.regex = ?, m.prepend = ?, m.target = ?, m.add = ?, m.to = ?,
          m.separator = ?, m.find = ?, m.tag = ?, m.template = ?
        WHERE m.id = ? AND m.userId = ?
      `,
      [
        modifier.name,
        modifier.type,
        modifier.subject,
        modifier.replacement,
        modifier.flags,
        modifier.regex,
        modifier.prepend,
        modifier.target,
        modifier.add,
        modifier.to,
        modifier.separator,
        modifier.find,
        modifier.tag,
        modifier.template,
        modifier.id,
        userId
      ]
    );
    if (!result.affectedRows) throw 'Could not edit modifier';

    db.release();
    return await getModifier(modifier.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
