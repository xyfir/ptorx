/**
 * Sets tasks to run at appropriate times.
 */
module.exports = function() {
  // Delete expired messages
  // Run every hour
  setInterval(require('jobs/cron/delete-expired-messages'), 3600 * 1000);

  // Sends notification emails to users whose subscription is near expiration
  // Run once a day
  setInterval(
    require('jobs/cron/send-subscription-expiration-emails'),
    86400 * 1000
  );

  // Delete unpaid affiliate-created accounts
  // Run once a day
  setInterval(
    require('jobs/cron/delete-unpaid-affiliate-accounts'),
    86400 * 1000
  );

  // Expires subscriptions by deleting proxy emails and their MG routes
  // Run once a day
  setInterval(require('jobs/cron/expire-subscriptions'), 86400 * 1000);
};
