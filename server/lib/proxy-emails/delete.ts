import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteProxyEmail(
  proxyEmailId: Ptorx.ProxyEmail['id'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    // Remove any information that could be linked to the creator
    // Keep in database so that a 'deleted' proxy email cannot be created again
    const result = await db.query(
      `
        UPDATE proxy_emails SET userId = NULL, name = NULL
        WHERE id = ? AND userId
      `,
      [proxyEmailId, userId]
    );
    if (!result.affectedRows) throw 'Could not delete proxy email';

    // Because proxy email is not actually getting deleted and thus won't
    // trigger an ON DELETE CASCADE we must manually remove the links
    await db.query('DELETE FROM links WHERE id = ?', [proxyEmailId]);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
