import { getAlias } from 'lib/aliases/get';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editAlias(
  alias: Ptorx.Alias,
  userId: number
): Promise<Ptorx.Alias> {
  const db = new MySQL();
  try {
    const user = await getUser(userId);

    if (user.tier == 'basic' && alias.saveMail)
      throw 'Basic users cannot save mail';
    if (alias.canReply && !alias.saveMail)
      throw 'You cannot reply to mail unless it is saved to Ptorx';
    if (alias.name.indexOf('"') > -1)
      throw 'Name cannot contain "double quotes"';

    const result = await db.query(
      `
        UPDATE aliases
        SET name = ?, saveMail = ?, canReply = ?
        WHERE id = ? AND userId = ?
      `,
      [alias.name, alias.saveMail, alias.canReply, alias.id, userId]
    );
    if (!result.affectedRows) throw 'Could not update alias';

    // Remove links from alias and add new ones if needed
    await db.query('DELETE FROM links WHERE aliasId = ?', [alias.id]);
    if (alias.links.length) {
      await db.query(
        `
          INSERT INTO links
            (aliasId, orderIndex, primaryEmailId, modifierId, filterId)
            VALUES ${alias.links.map(l => `(?, ?, ?, ?, ?)`).join(', ')}
        `,
        alias.links
          .map(l => [
            alias.id,
            l.orderIndex,
            l.primaryEmailId,
            l.modifierId,
            l.filterId
          ])
          /** @todo remove @ts-ignore eventually */
          // @ts-ignore
          .flat()
      );
    }

    db.release();
    return await getAlias(alias.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
