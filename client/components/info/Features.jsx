import React from 'react';

// react-md
import Paper from 'react-md/lib/Papers';

export default () => (
  <div className='features'>
    <h2>Features</h2>

    <Paper zDepth={1} component='section' className='section'>
      <header>
        <h3>Proxy Emails</h3>
        <p className='subtitle'>use proxy emails in place of your real addresses for increased security, privacy, and control</p>
      </header>
      <ul>
        <li><strong>Protect</strong> as many primary emails as you want.</li>
        <li>Easily create <strong>private proxy emails</strong> to forward incoming mail to your primary email addresses. Create your own addresses or have Ptorx randomly generate them for you.</li>
        <li><strong>Delete or update</strong> existing proxy emails at any time to stop receiving mail, change the mail you're receiving, or update where you receive it.</li>
        <li><strong>Optionally store incoming mail</strong> to certain proxy emails for later access from within the Ptorx app.</li>
        <li><strong>Anonymously reply</strong> to incoming mail from your proxy address either within your preferred mail client or through the Ptorx app.</li>
        <li><strong>Anonymously send mail</strong> from any of your proxy emails.</li>
        <li><strong>No hard limits</strong> on amount of incoming mail or total proxy emails you can have.</li>
        <li>Create proxy emails using <strong>custom domains</strong>. Bring your own, or add another user's domain to your account by requesting access to it. Add as many domains to your account as you want.</li>
        <li>Optionally have redirected mail show in your email client as being sent from the <strong>original sender</strong> and not from your proxy email.</li>
        <li>Optionally <strong>disable email redirection</strong> from a proxy email and only access incoming mail through the Ptorx app.</li>
        <li><strong>Keep your existing email</strong> addresses and access incoming mail from your preferred email site, app, or client.</li>
      </ul>
    </Paper>

    <Paper zDepth={1} component='section' className='section'>
      <header>
        <h3>Filters and Spam Blocking</h3>
        <p className='subtitle'>stop spam and any other unwanted mail</p>
      </header>
      <ul>
        <li>Use re-usable and highly customizable 'Filters' to <strong>block unwanted mail</strong>.</li>
        <li><strong>Filter incoming mail</strong> by its subject, sender address, sender domain, text content, html content, or by any of the email's headers.</li>
        <li><strong>Whitelist or blacklist</strong> mail based on whether its content matches a filter.</li>
        <li>Optionally use powerful <strong>regular expressions</strong> in your filters.</li>
        <li>Optionally ignore incoming mail that's <strong>detected as spam</strong>.</li>
        <li><strong>Link multiple filters</strong>   to multiple proxy emails.</li>
      </ul>
    </Paper>

    <Paper zDepth={1} component='section' className='section'>
      <header>
        <h3>Modifiers and Email Manipulation</h3>
        <p className='subtitle'>take control over the content of mail you receive</p>
      </header>
      <ul>
        <li><strong>Manipulate the content</strong> of incoming mail before it's redirected to your primary email addresses with re-usable and highly customizable 'Modifiers'.</li>
        <li><strong>Many modifiers available</strong>: text only, find and replace (with or without regular expressions), overwrite the subject, tag the subject with custom text, concatenate multiple email fields together, and Ptorx's custom 'Builder' modifier for complete control over certain email fields and their values.</li>
        <li><strong>Link multiple modifiers</strong> to multiple proxy emails.</li>
      </ul>
    </Paper>

    <Paper zDepth={1} component='section' className='section'>
      <header>
        <h3>Miscellaneous</h3>
        <p className='subtitle'>some other things we think you'll like</p>
      </header>
      <ul>
        <li><strong>We respect your privacy</strong>. All that's needed to use our service is your email to create an account with Xyfir Accounts. Pay with card (we won't save your info), or pay with Bitcoin. We won't snoop through your mail, and we'll only save it if you tell us to. We don't use any analytics or tracking services.</li>
        <li><strong>Access Ptorx from anywhere</strong>: on the web in your preferred browser, via our Google Chrome extension, in any of our desktop applications, or in our iOS or Android apps. You'll get the same experience everywhere.</li>
        <li>Constant development of <strong>new features</strong>. Got an idea for a new one? Let us know!</li>
        <li><strong>Detailed documentation</strong> that's accessible from within the app.</li>
        <li>30 day <strong>money-back guarantee</strong> on all purchases.</li>
        <li><strong>Email support</strong> for questions big or small.</li>
        <li>14 day <strong>free trial</strong> for all new users.</li>
      </ul>
    </Paper>

    <p>Some of these features may be limited or entirely unavailable during your free trial.</p>

    <p>
      Ready to purchase a Ptorx subscription? You can do so <a href='/panel/#account/purchase-subscription'>here</a>. $25 gets you access to all of those features, plus any future ones for an entire year.
    </p>
  </div>
)