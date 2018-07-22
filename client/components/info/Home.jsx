import { FontIcon, Button } from 'react-md';
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

    this.messages = [
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
    ];

    const group = Math.floor(Math.random() * this.messages.length);
    const line = Math.floor(Math.random() * this.messages[group].lines.length);

    this.state = {
      group,
      line,
      fade: 'in'
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ fade: 'out' });

      const group = Math.floor(Math.random() * this.messages.length);
      const line = Math.floor(
        Math.random() * this.messages[group].lines.length
      );
      this.setState({ group, line });
    }, 7500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { title, lines } = this.messages[this.state.group];
    const line = lines[this.state.line];

    return (
      <div className="home">
        <section className={'main fade-' + this.state.fade}>
          <h2>Ptorx {title}</h2>
          <p>{line}</p>
        </section>

        <section className="try-free">
          <Button
            secondary
            raised
            className="try-free"
            onClick={() =>
              (location.href = 'https://accounts.xyfir.com/register/service/13')
            }
          >
            Sign Up
          </Button>

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

          <a href="/app/">
            <Button secondary raised>
              Web
            </Button>
          </a>
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
      </div>
    );
  }
}
