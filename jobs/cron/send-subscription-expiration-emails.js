const sendEmail = require('lib/email/send');
const MySQL = require('lib/mysql');

module.exports = async function() {

  const db = new MySQL;

  try {
    await db.getConnection();
    const [{ start, end }] = await db.query(`SELECT
      UNIX_TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY)) * 1000 AS start,
      UNIX_TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 4 DAY)) * 1000 AS end
    `);

    const rows = await db.query(`
      SELECT email, trial FROM users
      WHERE subscription BETWEEN ${start} AND ${end}
    `);
    db.release();

    const normalMessage = `
      Your <a href='https://ptorx.com'>Ptorx</a> subscription is expiring soon! Increase your subscription in your <a href='https://ptorx.com/app/#/account/purchase-subscription'>user panel</a> before it's too late.
      <br /><br />
      If your subscription expires, any proxy emails you have created will be deleted and you will no longer be able to receive or send mail from them. Additionally, these deleted emails will <em>not</em> be able to be created again should you decide to purchase a new subscription after expiration.
      <br /><br />
      Thank you for being a Ptorx subscriber! We hope you'll stick around a bit longer.
      <br /><br /><br /><br />
      <strong>Have any questions or feedback?</strong> Send a reply to this email or use our <a href='https://xyfir.com/#/contact'>contact form</a>. <strong>Interested in other Xyfir projects?</strong> Take a look at all of our projects in the <a href='https://xyfir.com/#/network'>Xyfir Network</a>.
    `, trialMessage = `
      Your <a href='https://ptorx.com'>Ptorx</a> trial is expiring soon! Purchase a subscription in your <a href='https://ptorx.com/app/#/account/purchase-subscription'>user panel</a> before it's too late.
      <br /><br />
      If your trial expires, any proxy emails you have created will be deleted and you will no longer be able to receive or send mail from them. Additionally, these deleted emails will <em>not</em> be able to be created again should you decide to purchase a subscription after expiration.
      <br /><br />
      Have you fully explored Ptorx and all it has to offer? Some of things Ptorx can do includes, but is not limited to:
      <ul>
        <li><strong>Receive mail anonymously and securely</strong> using Ptorx's proxy emails. A proxy email hides your real email address, allowing you to receive mail in your normal inbox, while still protecting your privacy from anyone who receives your proxy email. Proxy emails also protect your accounts by preventing hackers from discovering your real email address.</li>
        <li><strong>Send and reply to mail anonymously</strong> using proxy emails. You can send mail from any of your proxy emails by viewing the proxy email in the Ptorx app and then navigating to the <em>Send</em> tab. If you have <em>Save Mail</em> enabled, you'll also be able to reply to mail anonymously either from within your proxy email's inbox, or from within your real email's inbox, just like you'd reply to any other mail.</li>
        <li><strong>Create as many proxy emails as you want</strong> with a Ptorx subscription. We recommend creating one for every website you create an account on, and one every time you give out your email for whatever reason.</li>
        <li><strong>Filter out unwanted mail and stop spam</strong> using Ptorx's Filters. Use premade filters to stop spam, or create your own custom whitelist or blacklist filters to prevent unwanted mail from ever reaching your inbox.</li>
        <li><strong>Modify mail before it's redirected</strong> using Ptorx's Modifiers. Text-only, search and replace, and subject tagging are just a few of the modifiers available. Gain full control over how each email appears in your inbox.</li>
        <li><strong>Use your own domains.</strong> Don't want your proxy emails to use ptorx.com? Bring as many of your own domains as you want to Ptorx, and create proxy emails using whichever domain you choose!</li>
        <li><strong>But wait, there's more!</strong> Check Ptorx's <a href="https://ptorx.com/features">features list</a> to see all we have to offer.</li>
      </ul>
      <br /><br />
      Thanks for trying out Ptorx! We hope you'll decide to try out a full Ptorx subscription. For just $25 USD you'll increase your privacy, security, and control over your experience on the web for an entire year. We accept cards and Bitcoin. Plus, we offer a risk-free, 30 day money-back guarantee as well!
      <br /><br /><br /><br />
      <strong>Have any questions or feedback?</strong> Send a reply to this email or use our <a href='https://xyfir.com/#/contact'>contact form</a>. <strong>Interested in other Xyfir projects?</strong> Take a look at all of our projects in the <a href='https://xyfir.com/#/network'>Xyfir Network</a>.
    `,
    normalSubject = 'Your subscription is expiring soon!',
    trialSubject = 'Your trial is expiring soon!';

    for (let row of rows) {
      await sendEmail({
        to: row.email,
        html: row.trial ? trialMessage : normalMessage,
        from: 'Ptorx <ptorx@xyfir.com>',
        domain: 'xyfir.com',
        subject: row.trial ? trialSubject : normalSubject
      });
    }
  }
  catch (err) {
    db.release();
    console.error('jobs/cron/send-subscription-expiration-emails', err);
  }

}