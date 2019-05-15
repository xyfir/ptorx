import { deleteExpiredMessages } from 'jobs/delete-expired-messages';
import { topUpCredits } from 'jobs/top-up-credits';
import { resetTiers } from 'jobs/reset-tiers';
import { MySQL } from 'lib/MySQL';

interface CronJob {
  id: number;
  name: string;
  lastRun: string;
  minutesInterval: number;
}

export async function cron(): Promise<never> {
  while (true) {
    try {
      const db = new MySQL();
      const jobs: CronJob[] = await db.query(`
      SELECT * FROM cron_jobs WHERE
        DATE_ADD(lastRun, INTERVAL minutesInterval MINUTE) < NOW() OR
        lastRun IS NULL
    `);

      for (let job of jobs) {
        console.log(new Date().toLocaleString(), `Running job ${job.name}`);

        switch (job.name) {
          case 'delete-expired-messages':
            await deleteExpiredMessages();
            break;
          case 'top-up-credits':
            await topUpCredits();
            break;
          case 'reset-tiers':
            await resetTiers();
            break;
          default:
            console.warn('Cannot assign job', job.name);
        }

        await db.query('UPDATE cron_jobs SET lastRun = NOW() WHERE id = ?', [
          job.id
        ]);
      }

      db.release();
    } catch (err) {
      console.error('cron', err);
    }

    await new Promise(r => setTimeout(r, 60 * 1000));
  }
}
