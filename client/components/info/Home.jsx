import React from 'react';

// react-md
import Button from 'react-md/lib/Buttons/Button';

export default () => (
  <div className='home'>
    <section className='main'>
      <div>
        <h1>Ptorx</h1>
        
        <span className='subtitle'>
          Proxy emails for an extra layer of security, privacy, and control for your emails.
        </span>

        <span className='platforms'>
          built for web, chrome, desktop, ios, and android
        </span>
      </div>
    </section>

    <section className='trial'>
      <Button
        secondary raised
        className='start-trial'
        onClick={() => location.href =
          'https://accounts.xyfir.com/app/#/register/13'
        }
      >Try Free</Button>
      
      <p>
        All that's needed to start your trial is a free <a target='_blank' href='https://accounts.xyfir.com/'>Xyfir Account</a>. No payment information required.
      </p>
    </section>

    <section className='overview'>
      <div className='item'>
        <h2>Increase Your Security</h2>
        <p>
          Prevent hackers and others with malicious intentions from discovering your real email.
        </p>
      </div>
      
      <div className='item'>
        <h2>Increase Your Privacy</h2>
        <p>
          Keep your real email secret and out of 'people search' websites.
        </p>
        <p>
          Prevent your accounts from being 'linked' across multiple different sites via email.
        </p>
      </div>

      <div className='item'>
        <h2>Decrease Spam And Unwanted Emails</h2>
        <p>
          Delete Ptorx emails you no longer want and stop receiving mail from them.
        </p>
        <p>
          Use filters to blacklist or whitelist received mail by content.
        </p>
      </div>

      <div className='item'>
        <h2>Increase Control Of Your Emails</h2>
        <p>
          Choose which mail gets redirected to your real email addresses.
        </p>
        <p>
          Modify incoming mail before it's redirected to you.
        </p>
      </div>
    </section>

    <section className='install with-screenshot'>
      <img src='//imgur.com/kJCPRM7.png' alt='Screenshot 1' />

      <div>
        <h2>Install</h2>
        <p>
          You can use Ptorx in your browser just like any other site. We also offer a Google Chrome extension as well as both mobile and desktop applications.
        </p>
        <a className='icon-chrome' href='https://chrome.google.com/webstore/detail/ptorx/jjhgjgpgkbnlihngkfnkafaidoggljge'>Chrome</a>
        <br />
        <a className='icon-apple' href='https://itunes.apple.com/us/app/ptorx/id1161180537'>iOS</a>
        <a className='icon-android' href='https://play.google.com/store/apps/details?id=com.xyfir.ptorx'>Android</a>
        <br />
        <a className='icon-apple' href='https://xyfir.com/downloads/Ptorx/Ptorx_Mac.app.zip'>Mac</a>
        <a className='icon-linux' href='https://xyfir.com/downloads/Ptorx/Ptorx_Linux.zip'>Linux</a>
        <a className='icon-windows' href='https://xyfir.com/downloads/Ptorx/Ptorx_Win.zip'>Windows</a>
      </div>
    </section>
    
    <section className='how-it-works with-screenshot'>
      <img src='//imgur.com/jevPhEx.png' alt='Screenshot 2' />

      <div>
        <h2>How it Works</h2>
        <ol>
          <li>Create a redirect email from our site, extension, or app</li>
          <li>Add any optional customizations (filters, modifiers, etc)</li>
          <li>Use the new redirect email we give you to sign up with a site or receive emails</li>
          <li>Emails are sent to your Ptorx address</li>
          <li>Our system makes sure the incoming mail matches your provided filters</li>
          <li>Our system then applies any modifiers you specified, to the message</li>
          <li>The email is then redirected to your main email, or stored on Ptorx for later viewing</li>
        </ol>
      </div>
    </section>
    
    <section className='privacy with-screenshot'>
      <img src='//imgur.com/UQ1y4XA.png' alt='Screenshot 3' />

      <div>
        <h2>Privacy</h2>
        <p>
          Ptorx increases by acting as a proxy for your emails. Any mail sent to one of your Ptorx addresses is redirected to your real email address. Anyone who receives your Ptorx address will not be able to find your real email.
        </p>
      </div>
    </section>
    
    <section className='safe-from-spam with-screenshot'>
      <img src='//imgur.com/7mobLZ4.png' alt='Screenshot 4' />

      <div>
        <h2>Safe From Spam</h2>
        <p>
          If a spammer ever obtains one of your Ptorx addresses, all you have to do is delete the Ptorx address and no more spam will be redirected to your main email. Additionally, you can utilize our filter system to filter out unwanted emails.
        </p>
      </div>
    </section>
    
    <section className='security with-screenshot'>
      <img src='//imgur.com/07emOvt.png' alt='Screenshot 5' />

      <div>
        <h2>Improved Security</h2>
        <p>
          An email can be a valuable thing for a hacker, spammer, or other malicious user on the internet. Ptorx can help keep your accounts safe and you can utlize filters to keep out phishing, spam, and other unwanted mail.
        </p>
      </div>
    </section>
    
    <section className='control'>
      <h2>Control Your Email</h2>
      <p>Our filter and modifier systems allow you to control your email like never before.</p>
      
      <h3>Filters</h3>
      <p>
        Filters allow you to determine what emails actually get redirected to your real address by checking for values in any messages received. They are a great way to unwanted messages of all kinds. Filters include subject, sender address, sender domain, text content, HTML content, and email header filters. You can configure your email to ignore messages where a filter matches, or only accept messages that match all provided filters. You can also utilize <a target='_blank' href='https://regexone.com/'>regular expressions</a> for more advanced filters.
      </p>
      
      <h3>Modifiers</h3>
      <p>
        Modifiers allow you to modify an incoming message's content before it is redirected to your real address. Modifiers include, but are not limited to: text only mode (removes HTML), find and replace, subject overwrite, and subject tag modifiers. Subject tag modifiers allow you to 'tag' any incoming emails by prepending or appending a string of text to the original email's subject.  
      </p>
    </section>
    
    <section className='keep-your-email with-screenshot'>
      <img src='//imgur.com/3EGyVD7.png' alt='Screenshot 6' />

      <div>
        <h2>Keep Your Email</h2>
        <p>
          Since Ptorx just redirects messages to you, you don't have to give up your existing address. You can still receive and view your messages in your normal email programs, apps, and websites.
        </p>
      </div>
    </section>
    
    <section className='premium'>
      <h2>Ptorx Premium</h2>
      <p>
        You can purchase a premium subscription <a href='panel/#account/purchase-subscription'>here</a>.
      </p>

      <table>
        <thead>
          <tr>
            <th>Months</th><th>Monthly Cost</th><th>Total Cost</th><th>All Features</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>One</td><td>$3.00</td><td>$3.00</td><td>Yes</td>
          </tr>
          <tr>
            <td>Six</td><td>$2.50</td><td>$15.00</td><td>Yes</td>
          </tr>
          <tr>
            <td>Twelve</td><td>$2.00</td><td>$24.00</td><td>Yes</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
);