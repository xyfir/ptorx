import { TIERS } from 'constants/tiers';
import { MySQL } from 'lib/MySQL';

export async function resetTiers() {
  const db = new MySQL();
  try {
    await db.query(
      `
        UPDATE users SET tier = ?, credits = ?, tierExpiration = NULL
        WHERE tierExpiration IS NOT NULL AND UNIX_TIMESTAMP() >= tierExpiration
      `,
      [TIERS[0].name, TIERS[0].credits]
    );
  } catch (err) {
    console.error('cron/reset-tiers', err);
  }
  db.release();
}
