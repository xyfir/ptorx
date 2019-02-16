import { MySQL } from 'lib/MySQL';

export async function setupTests() {
  const db = new MySQL();
  await db.query(`
    INSERT INTO users (userId, email, credits, tier, tierExpiration) VALUES
      (1234, 'test@example.com', 10000, 'ultimate', UNIX_TIMESTAMP() + 999),
      (12345, 'test@example.com', 1500, 'premium', UNIX_TIMESTAMP() + 999),
      (123456, 'test@example.com', 100, 'basic', NULL)
  `);
  db.release();
}
