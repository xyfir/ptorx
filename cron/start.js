const cron = require("cron");

/*
    Sets tasks to run at appropriate times
    Handles errors / responses from tasks
*/
module.exports = function() {
    
    const tasks = {
        sendSubscriptionEpirationEmails:
            require("./send-subscription-expiration-emails"),
        deleteExpiredMessages:
            require("./delete-expired-messages"),
        expireSubscriptions:
            require("./expire-subscriptions")
    };

    // Delete expired messages
    // Runs every hour
    // No retry
    new cron.CronJob(
        "2 * * * *",
        () => tasks.deleteExpiredMessages(),
        () => 1,
        true
    );

    // Sends notification emails to users whose subscription is near expiration
    // Run once a day
    // Retries once on failure
    new cron.CronJob(
        "0 1 * * *",
        () => tasks.sendSubscriptionEpirationEmails(err => {
            if (err) tasks.sendSubscriptionEpirationEmails(() => 1);
        }),
        () => 1,
        true
    );

    // Expires subscriptions by deleting emails, filters, etc
    // Run once a day
    // No retry
    new cron.CronJob(
        "0 2 * * *",
        () => tasks.expireSubscriptions(),
        () => 1,
        true
    );

};