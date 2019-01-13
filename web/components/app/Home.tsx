import { ListItem, Toolbar, FontIcon, Divider, Drawer, Button } from 'react-md';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';
import * as qs from 'qs';

export class HowItWorks extends React.Component<{}, { view: boolean }> {
  state = { view: false };

  constructor(props) {
    super(props);
  }

  render() {
    return this.state.view ? (
      <div className="how-ptorx-works view">
        <span>Ptorx at its most basic level is very simple:</span>
        <ol>
          <li>
            Create a new proxy email from within the Ptorx app, site, or
            extension by choosing your own address and domain or letting Ptorx
            randomly choose for you.
          </li>
          <li>
            Optionally, enable redirecting incoming mail to one of your
            "primary" addresses, saving mail to Ptorx for later viewing, or
            both.
          </li>
          <li>
            Use your proxy email to create accounts, or give it to people as
            your contact address.
          </li>
          <li>
            A site or person sends mail to your proxy email. If your proxy
            address is set to redirect incoming mail to your primary address,
            the process will look something like this:
            <span className="address"> account-creation@some-site.com </span>
            to
            <span className="address"> proxy-address@ptorx.com </span>,
            redirected to
            <span className="address"> primary-address@gmail.com</span>.
          </li>
        </ol>
        <span>
          There are lots of other features as well, like filters, modifiers,
          saving mail, and much more!
        </span>
      </div>
    ) : (
      <div className="how-ptorx-works start">
        <h2>Interested in how Ptorx works?</h2>
        <Button
          flat
          primary
          iconChildren="info"
          onClick={() => this.setState({ view: true })}
        >
          Learn More
        </Button>
      </div>
    );
  }
}

const LearnMore = ({ page }) => (
  <Link to={page}>
    <FontIcon primary>info</FontIcon>Learn More
  </Link>
);

export class Home extends React.Component<
  {},
  { drawer: boolean; loggedIn: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { drawer: false, loggedIn: false };
  }

  componentDidMount() {
    const q = qs.parse(location.search);
    for (let k in q) localStorage[k] = q[k];
    api
      .get('/account', { params: { token: localStorage.accessToken || '' } })
      .then(res => this.setState({ loggedIn: res.data.loggedIn }));
  }

  render() {
    return (
      <div className="ptorx-info">
        <Toolbar
          colored
          fixed
          actions={[
            <Button to="/" icon iconChildren="home" component={Link} />
          ]}
          title="Ptorx"
          nav={
            <Button
              icon
              iconChildren="menu"
              onClick={() => this.setState({ drawer: true })}
            />
          }
        />

        <Drawer
          onVisibilityChange={v => this.setState({ drawer: v })}
          autoclose={true}
          navItems={(this.state.loggedIn
            ? [
                <Link to="/app">
                  <ListItem primaryText="App" />
                </Link>
              ]
            : [
                <a href="https://accounts.xyfir.com/login/service/13">
                  <ListItem primaryText="Login" />
                </a>,
                <a href="https://accounts.xyfir.com/register/service/13">
                  <ListItem primaryText="Register" />
                </a>
              ]
          ).concat([
            <Divider />,

            <Link to="/features">
              <ListItem primaryText="Feature List" />
            </Link>,
            <Link to="/docs">
              <ListItem primaryText="Help Docs" />
            </Link>
          ])}
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  iconChildren="arrow_back"
                  onClick={() => this.setState({ drawer: false })}
                />
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />

        <div className="main md-toolbar-relative">
          <div className="home">
            <section className="main">
              <h1>Send & Receive Mail Anonymously</h1>
              <p>
                Hide your real email addresses with Ptorx to protect your
                privacy on the web.
              </p>
            </section>

            <section className="try-free">
              <a href="https://accounts.xyfir.com/register/service/13">
                <Button secondary raised className="try-free">
                  Sign Up
                </Button>
              </a>

              <p>
                All that's needed to start using Ptorx for free is a valid email
                to create a Xyfir Account. No payment info required.
              </p>
            </section>

            <section className="how-it-works">
              <HowItWorks />
            </section>

            <section className="install">
              <h2>Install</h2>
              <p>
                You can use Ptorx in your browser just like any other site. We
                also offer a Google Chrome extension as well as mobile
                applications.
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
                  Keep your real email addresses private while still receiving
                  and sending mail from them.
                </p>
                <LearnMore page="anonymous-emails" />
              </div>

              <div>
                <h3>Secure Emails</h3>
                <p>
                  Prevent hackers from discovering your real emails and any
                  accounts you've created across the web.
                </p>
                <LearnMore page="safe-and-secure-emails" />
              </div>

              <div>
                <h3>Stop Unwanted Mail</h3>
                <p>
                  Use custom or premade filters, disable mail redirection, or
                  delete proxy emails that are receiving spam.
                </p>
                <LearnMore page="stop-unwanted-mail" />
              </div>

              <div>
                <h3>Temporary Addresses</h3>
                <p>
                  Just need a quick, disposable address that only you have
                  access to? Ptorx makes it easy.
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
                  Email redirection, custom filters, modify incoming mail
                  content, send or reply anonymously, and much more.
                </p>
                <LearnMore page="features" />
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
}
