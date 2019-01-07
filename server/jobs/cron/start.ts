import { deleteUnpaidAffiliateAccounts } from 'jobs/cron/delete-unpaid-affiliate-accounts';
import { deleteExpiredMessages } from 'jobs/cron/delete-expired-messages';

export function startCronJobs() {
  // Delete expired messages
  // Run every hour
  setInterval(deleteExpiredMessages, 3600 * 1000);

  // Delete unpaid affiliate-created accounts
  // Run once a day
  setInterval(deleteUnpaidAffiliateAccounts, 86400 * 1000);
}
