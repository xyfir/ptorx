import { XACC, LOG_STATE, ENVIRONMENT } from 'constants/config';
import { changeView, hideWelcome } from 'actions/index';
import { Button, DialogContainer } from 'react-md';
import { CREATE_REDIRECT_EMAIL } from 'constants/views';
import { INITIALIZE_STATE } from 'constants/actions';
import { ModifiersRouter } from 'components/modifiers/Router';
import { Documentation } from 'components/misc/Documentation';
import { AppNavigation } from 'components/app/Navigation';
import { DomainsRouter } from 'components/domains/Domains';
import { AccountRouter } from 'components/account/Router';
import { FiltersRouter } from 'components/filters/Router';
import { EmailsRouter } from 'components/emails/Router';
import { QuickSearch } from 'components/app/QuickSearch';
import { parseQuery } from 'lib/parse-query-string';
import { getView } from 'lib/get-view';
import { render } from 'react-dom';
import * as React from 'react';
import * as swal from 'sweetalert';
import { Store } from 'lib/store';
import { hot } from 'react-hot-loader';
import { api } from 'lib/api';

class App extends React.Component {
  constructor(props) {
    super(props);

    Store.subscribe(state => this.setState(state));
    if (LOG_STATE) Store.subscribe(state => console.log(state));

    const initialize = async () => {
      // Access token is generated upon a successful login
      // Used to create new session without forcing login each time
      const token = localStorage.accessToken || '';

      // Access token is required
      if (!token && ENVIRONMENT != 'development') {
        location.href = XACC + '/login/service/13';
      }

      const state = {
        modifiers: [],
        messages: [],
        welcome: !localStorage.hasRun,
        filters: [],
        domains: [],
        emails: [],
        account: {
          credits: 0,
          emails: [],
          uid: 0
        },
        view: CREATE_REDIRECT_EMAIL
      };

      api
        .get('/account', { params: { token } })
        .then(res => {
          if (!res.data.loggedIn) {
            location.href = `${XACC}/login/service/13`;
            return;
          }

          state.account = res.data;
          return Promise.all([
            api.get('/emails'),
            api.get('/domains'),
            api.get('/filters'),
            api.get('/modifiers')
          ]);
        })
        .then(res => {
          state.emails = res[0].data.emails;
          state.domains = res[1].data.domains;
          state.filters = res[2].data.filters;
          state.modifiers = res[3].data.modifiers;

          // Push initial state to store
          Store.dispatch({
            type: INITIALIZE_STATE,
            state
          });
          this.state = state;

          // Set state based on current url hash
          Store.dispatch(changeView(getView(state)));

          // Update state according to url hash
          window.onhashchange = () => {
            // Force old hash route format to new one
            // `#${route}` -> `#/${route}`
            if (location.hash.indexOf('#/') != 0)
              return (location.hash = '#/' + location.hash.substr(1));
            Store.dispatch(changeView(getView(state)));
          };
        })
        .catch(err => swal('Error', err.response.data.error, 'error'));
    };

    const q = parseQuery(location.hash);

    // PhoneGap app opens to ptorx.com/panel/#?phonegap=1
    if (q.phonegap) {
      localStorage.isPhoneGap = true;
      initialize();
      location.hash = '';
    }
    // Attempt to login using XID/AUTH or skip to initialize()
    else if (q.xid && q.auth) {
      if (localStorage.r) {
        const [type, value] = localStorage.r.split('~');
        const referral = {
          type,
          [type]: value,
          data: Object.assign({}, localStorage)
        };

        delete referral.data.accessToken, delete referral.data.r;

        q.referral = referral;
      }

      api
        .post('/account/login', q)
        .then(res => {
          localStorage.accessToken = res.data.accessToken;
          initialize();
          location.hash = location.hash.split('?')[0];
        })
        .catch(() => (location.href = `${XACC}/login/service/13`));
    } else {
      initialize();
    }
  }

  onHideWelcome() {
    Store.dispatch(hideWelcome());
    localStorage.hasRun = true;
  }

  dispatch(action) {
    return Store.dispatch(action);
  }

  render() {
    if (!this.state) return null;

    const { account, welcome } = this.state;

    const view = (() => {
      const props = {
        data: this.state,
        dispatch: Store.dispatch,
        App: this // eventually remove other props and just use App
      };

      switch (this.state.view.split('/')[0]) {
        case 'QUICK_SEARCH':
          return <QuickSearch {...props} />;
        case 'MODIFIERS':
          return <ModifiersRouter {...props} />;
        case 'DOMAINS':
          return <DomainsRouter {...props} />;
        case 'ACCOUNT':
          return <AccountRouter {...props} />;
        case 'FILTERS':
          return <FiltersRouter {...props} />;
        case 'EMAILS':
          return <EmailsRouter {...props} />;
        case 'DOCS':
          return <Documentation file={location.hash.split('/')[2]} />;
      }
    })();

    return (
      <div className="ptorx">
        <AppNavigation App={this} />

        <div className="main md-toolbar-relative">{view}</div>

        <DialogContainer
          id="welcome-dialog"
          onHide={() => this.onHideWelcome()}
          visible={welcome}
        >
          <h2>What are credits?</h2>
          <p>
            Before you get started with Ptorx, it's important to take just a
            second to learn what credits are and how they work. Simply put:
            credits allow you to send and receive mail. This also includes
            redirecting incoming mail to your primary addresses and replying to
            received mail.
          </p>
          <p>
            You have <strong>{account.credits} credits</strong> available.
            Whenever you send or receive mail your credits will decrease,
            usually by one or two credits per action. When your credits reach 0,
            your proxy emails are <em>disabled</em>, meaning they'll no longer
            work! Once you receive credits afterwards, your proxy emails will be
            enabled again and everything will work as before.
          </p>
          <p>
            Credits can be <a href="#/account/credits/purchase">purchased</a>,
            or <a href="#/account/credits/earn">earned</a>, and are also
            rewarded when you <a href="#/account/credits/earn">refer</a> other
            users to Ptorx!
          </p>
          <p>
            If you're ever feeling confused, open the app menu and check out the{' '}
            <a href="#/docs/help">Help Docs</a>!
          </p>
          <Button primary raised onClick={() => this.onHideWelcome()}>
            Got it, thanks!
          </Button>
        </DialogContainer>
      </div>
    );
  }
}

render(hot(module)(App), document.getElementById('content'));
