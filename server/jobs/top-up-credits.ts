import { TIERS } from 'lib/users/tiers';
import { MySQL } from 'lib/MySQL';

export async function topUpCredits() {
  const db = new MySQL();
  try {
    await db.query(
      `
        UPDATE users SET
          credits = CASE
            ${TIERS.map(() => `WHEN tier = ? THEN ?`).join('\n')}
          END
      `,
      /** @todo remove @ts-ignore eventually */
      // @ts-ignore
      TIERS.map(tier => [tier.name, tier.credits]).flat()
    );
  } catch (err) {
    console.error('cron/top-up-credits', err);
  }
  db.release();
}
