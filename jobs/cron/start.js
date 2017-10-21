const sendSubscriptionEpirationEmails =
  require('jobs/cron/send-subscription-expiration-emails');
const deleteExpiredMessages =
  require('jobs/cron/delete-expired-messages');
const expireSubscriptions =
  require('jobs/cron/expire-subscriptions');

/**
 * Sets tasks to run at appropriate times.
 */
module.exports = function() {

  // Delete expired messages
  // Run every hour
  setInterval(deleteExpiredMessages, 3600 * 1000);

  // Sends notification emails to users whose subscription is near expiration
  // Run once a day
  setInterval(sendSubscriptionEpirationEmails, 86400 * 1000);

  // Expires subscriptions by deleting proxy emails and their MG routes
  // Run once a day
  setInterval(expireSubscriptions, 86400 * 1000);

};