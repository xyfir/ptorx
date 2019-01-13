import { MySQL } from 'lib/MySQL';

export async function setupTests() {
  const db = new MySQL();
  await db.query('DELETE FROM users WHERE userId = 1234');
  await db.query('INSERT INTO users (userId) VALUES (1234)');
  db.release();
}
