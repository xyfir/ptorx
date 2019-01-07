export function startCronJobs() {
  // Delete expired messages
  // Run every hour
  setInterval(require('jobs/cron/delete-expired-messages'), 3600 * 1000);

  // Delete unpaid affiliate-created accounts
  // Run once a day
  setInterval(
    require('jobs/cron/delete-unpaid-affiliate-accounts'),
    86400 * 1000
  );
}
