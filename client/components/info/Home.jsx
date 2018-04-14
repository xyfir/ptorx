import { FontIcon, Button } from 'react-md';
import Typed from 'typed.js';
import React from 'react';

// Components
import HowItWorks from 'components/info/HowItWorks';

const LearnMore = ({ page }) => (
  <a href={page}>
    <FontIcon primary>info</FontIcon>Learn More
  </a>
);

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    (this.messages = [
      {
        title: 'Strengthens Your Security',
        lines: [
          'Prevent hackers and anyone else from discovering your real email.',
          'Use different proxy emails for every account you create and person you contact.'
        ]
      },
      {
        title: 'Protects Your Privacy',
        lines: [
          'Keep your real email secret and out of people search websites.',
          'Prevent your accounts from being linked across multiple different sites via email.'
        ]
      },
      {
        title: 'Stops Unwanted Mail',
        lines: [
          'Disable redirection or delete proxy emails to stop receiving mail from them.',
          'Use filters to blacklist or whitelist received mail by its content.'
        ]
      },
      {
        title: 'Gives You Control',
        lines: [
          'Choose which mail gets redirected where and when.',
          'Modify incoming mail before it gets redirected to you.'
        ]
      }
    ]),
      (this.state = {
        message: Math.floor(Math.random() * this.messages.length),
        fade: 'in'
      }),
      (this._startTyping = this._startTyping.bind(this));
  }

  componentDidMount() {
    this._startTyping();
  }

  /**
   * Called when Typed.js completes the lines in a message.
   */
  onTypedComplete() {
    this.setState({ fade: 'out' });

    // There's probably a better way to do this animation...
    setTimeout(() => {
      let { message } = this.state;

      // Last message in list, go to first message
      if (!this.messages[message + 1]) message = 0;
      // Go to next message
      else message++;

      this.setState({ message, fade: 'in' }, () => this._startTyping());
    }, 250);
  }

  /**
   * Starts typing the lines in a specific message and adds onComplete
   * listener.
   */
  _startTyping() {
    const { message } = this.state;
    this.typed && this.typed.destroy();

    this.typed = new Typed('span.typed-home', {
      strings: this.messages[message].lines,
      onComplete: () => setTimeout(() => this.onTypedComplete(), 5000),
      startDelay: 1000,
      backDelay: 5000,
      typeSpeed: 45,
      backSpeed: 0,
      fadeOut: true,
      loop: false
    });
  }

  render() {
    const message = this.messages[this.state.message];

    return (
      <div className="home">
        <section className={'main fade-' + this.state.fade}>
          <h1>Ptorx {message.title}</h1>

          <div className="typed-container">
            <span className="typed-home" />
          </div>
        </section>

        <section className="trial">
          <Button
            secondary
            raised
            className="start-trial"
            onClick={() =>
              (location.href = 'https://accounts.xyfir.com/app/#/register/13')
            }
          >
            Try Free
          </Button>

          <p>
            All that's needed to start your 14 day free trial is a valid email
            to create a Xyfir Account. No payment info required.
          </p>
        </section>

        <section className="how-it-works">
          <HowItWorks />
        </section>

        <section className="install">
          <h2>Install</h2>
          <p>
            You can use Ptorx in your browser just like any other site. We also
            offer a Google Chrome extension as well as both mobile and desktop
            applications.
          </p>

          <Button secondary raised onClick={() => (location.href = 'app/')}>
            Web
          </Button>
          <Button
            secondary
            raised
            onClick={() =>
              (location.href =
                'https://chrome.google.com/webstore/detail/ptorx/jjhgjgpgkbnlihngkfnkafaidoggljge')
            }
          >
            Chrome
          </Button>
          <Button
            secondary
            raised
            onClick={() =>
              (location.href =
                'https://itunes.apple.com/us/app/ptorx/id1161180537')
            }
          >
            iOS
          </Button>
          <Button
            secondary
            raised
            onClick={() =>
              (location.href =
                'https://play.google.com/store/apps/details?id=com.xyfir.ptorx')
            }
          >
            Android
          </Button>
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
              Just need a quick, disposable address that only you have access
              to? Ptorx makes it easy.
            </p>
            <LearnMore page="temporary-emails" />
          </div>

          <div>
            <h3>Easy Email Forwarding</h3>
            <p>
              Create proxy addresses with ptorx.com or your own domains that
              forward mail to your primary addresses.
            </p>
            <LearnMore page="email-forwarding" />
          </div>

          <div>
            <h3>Take Control</h3>
            <p>
              Email redirection, custom filters, modify incoming mail content,
              send or reply anonymously, and much more.
            </p>
            <LearnMore page="features" />
          </div>
        </section>

        <section className="subscription">
          <h2>Ptorx Subscription</h2>
          <span className="price">$9.99 per year</span>

          <ul className="features">
            <li>
              All of Ptorx's <a href="features">features</a>
            </li>
            <li>30 day money-back guarantee</li>
            <li>Pay with card or Bitcoin</li>
            <li>Try free for 14 days</li>
          </ul>

          <Button
            secondary
            raised
            onClick={() =>
              (location.href = 'https://accounts.xyfir.com/app/#/register/13')
            }
          >
            Try Free
          </Button>
        </section>
      </div>
    );
  }
}
