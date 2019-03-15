import { getAlias } from 'lib/aliases/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteAlias(
  aliasId: Ptorx.Alias['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    const alias = await getAlias(aliasId, userId);
    await db.query('INSERT INTO deleted_aliases SET ?', {
      domainId: alias.domainId,
      address: alias.address
    });
    await db.query('DELETE FROM aliases WHERE id = ?', [aliasId]);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
