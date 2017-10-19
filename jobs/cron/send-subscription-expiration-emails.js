const sendEmail = require('lib/email/send');
const mysql = require('lib/mysql');

module.exports = async function() {

  const db = new mysql;

  try {
    await db.getConnection();
    const [{ start, end }] = await db.query(`SELECT
      UNIX_TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY)) * 1000 AS start,
      UNIX_TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 4 DAY)) * 1000 AS end
    `);

    const rows = await db.query(`
      SELECT email FROM users
      WHERE subscription BETWEEN ${start} AND ${end}
    `);
    db.release();

    const html = `
      Your <a href='https://ptorx.com'>Ptorx</a> subscription is expiring soon! Increase your subscription in your <a href='https://ptorx.com/app/#/account/purchase-subscription'>user panel</a> before it's too late.
      <br /><br />
      If your subscription expires, any proxy emails you have created will be deleted and you will no longer receive mail from them. Additionally, these deleted emails will <em>not</em> be able to be created again should you decide to purchase a new subscription after expiration.
      <br /><br />
      Thank you for being a Ptorx subscriber! We hope you'll stick around a bit longer.
      <br /><br />
      Have any questions or feedback? Send a reply to this email or use our <a href='https://xyfir.com/#/contact'>contact form</a>. Interested in other Xyfir projects? Take a look at all of our projects in the <a href='https://xyfir.com/#/network'>Xyfir Network</a>.
    `;

    for (let row of rows) {
      await sendEmail({
        to: row.email,
        html,
        from: 'Ptorx <ptorx@xyfir.com>',
        domain: 'xyfir.com',
        subject: 'Your subscription is expiring soon!'
      });
    }
  }
  catch (err) {
    db.release();
    console.error('jobs/cron/send-subscription-expiration-emails', err);
  }

}