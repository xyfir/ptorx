import { MySQL } from 'lib/MySQL';

export async function teardownTests() {
  const db = new MySQL();
  await db.query('DELETE FROM users WHERE userId = 1234 OR userId = 12345');
  db.release();
}
