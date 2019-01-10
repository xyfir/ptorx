import { FontIcon, Button } from 'react-md';
import { HowItWorks } from 'components/info/HowItWorks';
import * as React from 'react';
import { Link } from 'react-router-dom';

const LearnMore = ({ page }) => (
  <Link to={page}>
    <FontIcon primary>info</FontIcon>Learn More
  </Link>
);

export const Home = () => (
  <div className="home">
    <section className="main">
      <h1>Send & Receive Mail Anonymously</h1>
      <p>
        Hide your real email addresses with Ptorx to protect your privacy on the
        web.
      </p>
    </section>

    <section className="try-free">
      <a href="https://accounts.xyfir.com/register/service/13">
        <Button secondary raised className="try-free">
          Sign Up
        </Button>
      </a>

      <p>
        All that's needed to start using Ptorx for free is a valid email to
        create a Xyfir Account. No payment info required.
      </p>
    </section>

    <section className="how-it-works">
      <HowItWorks />
    </section>

    <section className="install">
      <h2>Install</h2>
      <p>
        You can use Ptorx in your browser just like any other site. We also
        offer a Google Chrome extension as well as mobile applications.
      </p>

      <Link to="/app">
        <Button secondary raised>
          Web
        </Button>
      </Link>
      <a href="https://goo.gl/UESGjB">
        <Button secondary raised>
          Chrome
        </Button>
      </a>
      <a href="https://goo.gl/1dtBUC">
        <Button secondary raised>
          iOS
        </Button>
      </a>
      <a href="https://goo.gl/5YAqBT">
        <Button secondary raised>
          Android
        </Button>
      </a>
    </section>

    <section className="overview">
      <div>
        <h3>Anonymous Proxy Emails</h3>
        <p>
          Keep your real email addresses private while still receiving and
          sending mail from them.
        </p>
        <LearnMore page="anonymous-emails" />
      </div>

      <div>
        <h3>Secure Emails</h3>
        <p>
          Prevent hackers from discovering your real emails and any accounts
          you've created across the web.
        </p>
        <LearnMore page="safe-and-secure-emails" />
      </div>

      <div>
        <h3>Stop Unwanted Mail</h3>
        <p>
          Use custom or premade filters, disable mail redirection, or delete
          proxy emails that are receiving spam.
        </p>
        <LearnMore page="stop-unwanted-mail" />
      </div>

      <div>
        <h3>Temporary Addresses</h3>
        <p>
          Just need a quick, disposable address that only you have access to?
          Ptorx makes it easy.
        </p>
        <LearnMore page="temporary-emails" />
      </div>

      <div>
        <h3>Easy Email Forwarding</h3>
        <p>
          Create proxy addresses with ptorx.com or your own domains that forward
          mail to your primary addresses.
        </p>
        <LearnMore page="email-forwarding" />
      </div>

      <div>
        <h3>Take Control</h3>
        <p>
          Email redirection, custom filters, modify incoming mail content, send
          or reply anonymously, and much more.
        </p>
        <LearnMore page="features" />
      </div>
    </section>
  </div>
);
