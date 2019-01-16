import { MySQL } from 'lib/MySQL';

export async function deleteExpiredMessages() {
  const db = new MySQL();
  try {
    // Delete after 30 days
    await db.query(`
      DELETE FROM messages WHERE created + 2592000 < UNIX_TIMESTAMP()
    `);
  } catch (err) {}
  db.release();
}
