import { deleteExpiredMessages } from 'jobs/delete-expired-messages';
import { MySQL } from 'lib/MySQL';

interface CronJob {
  id: number;
  name: string;
  lastRun: string;
  minutesInterval: number;
}

export async function cron(): Promise<never> {
  const db = new MySQL();
  while (true) {
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
        default:
          console.warn('Cannot assign job', job.name);
      }

      await db.query('UPDATE cron_jobs SET lastRun = NOW() WHERE id = ?', [
        job.id
      ]);
    }

    await new Promise(r => setTimeout(r, 60 * 1000));
  }
}
