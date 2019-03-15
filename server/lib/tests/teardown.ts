import { MySQL } from 'lib/MySQL';

export async function teardownTests() {
  const db = new MySQL();
  await db.query("DELETE FROM users WHERE email = 'test@example.com'");
  await db.query('DELETE FROM deleted_aliases');
  db.release();
}
