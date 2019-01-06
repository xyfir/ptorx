const deleteUser = require('lib/user/delete');
const MySQL = require('lib/mysql');

module.exports = async function() {
  const db = new MySQL();

  try {
    // Load all affilates who haven't made a payment in over 32 days
    await db.getConnection();
    const affiliates = await db.query(`
      SELECT user_id AS id, last_payment
      FROM affiliates
      WHERE last_payment < DATE_SUB(NOW(), INTERVAL 32 DAY)
    `);

    for (let affilate of affiliates) {
      // Get all of the users who the affiliate created between their last
      // payment and 32 days ago
      const users = await db.query(
        `
          SELECT user_id AS id
          FROM affiliate_created_users
          WHERE
            affiliate_id = ? AND
            created_at > ? AND
            created_at < DATE_SUB(NOW(), INTERVAL 32 DAY)
        `,
        [affilate.id, affilate.last_payment]
      );

      for (let user of users) await deleteUser(db, user.id);
    }

    db.release();
  } catch (err) {
    console.log('[cron] delete-unpaid-affiliate-accounts', err);
    db.release();
  }
};
