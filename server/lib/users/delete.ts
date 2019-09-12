import { deleteAlias } from 'lib/aliases/delete';
import { listAliases } from 'lib/aliases/list';
import { MySQL } from 'lib/MySQL';

export async function deleteUser(userId: number): Promise<void> {
  const db = new MySQL();
  try {
    // Get all of user's aliases
    const aliases = await listAliases(userId);

    // Mark all aliases as deleted
    for (let alias of aliases) await deleteAlias(alias.id, userId);

    // Delete user's account and everything linked to it
    await db.query('DELETE FROM users WHERE userId = ?', [userId]);

    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
