import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getAlias(
  aliasId: number,
  userId: number
): Promise<Ptorx.Alias> {
  const db = new MySQL();
  try {
    const [alias]: Ptorx.Alias[] = await db.query(
      `
        SELECT a.*, CONCAT(a.address, '@', d.domain) AS fullAddress
        FROM aliases a
        LEFT JOIN domains d ON d.id = a.domainId
        WHERE a.id = ? AND a.userId = ?
      `,
      [aliasId, userId]
    );
    if (!alias) throw 'Could not find alias';

    alias.links = await db.query('SELECT * FROM links WHERE aliasId = ?', [
      aliasId
    ]);
    db.release();

    alias.saveMail = !!alias.saveMail;
    alias.canReply = !!alias.canReply;

    return alias;
  } catch (err) {
    db.release();
    throw err;
  }
}
