import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getMessage(
  messageId: Ptorx.Message['id'],
  /** User id of message owner or the message's key */
  authentication: number | Ptorx.Message['key']
): Promise<Ptorx.Message> {
  const db = new MySQL();
  try {
    const [message] = await db.query(
      `
        SELECT
          m.*, a.userId,
          CONCAT(m.id, '--', m.key, '--reply-x@', d.domain) AS ptorxReplyTo
        FROM messages m
        INNER JOIN aliases a ON m.aliasId = a.id
        INNER JOIN domains d ON d.id = a.domainId
        WHERE m.id = ? AND ${
          typeof authentication == 'number' ? 'a.userId' : 'm.key'
        } = ?
      `,
      [messageId, authentication]
    );
    if (!message) throw 'Could not find message';

    db.release();
    return message;
  } catch (err) {
    db.release();
    throw err;
  }
}
