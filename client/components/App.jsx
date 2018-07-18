import 'babel-polyfill';

import { Button, DialogContainer } from 'react-md';
import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Components
import Documentation from 'components/misc/Documentation';
import QuickSearch from 'components/app/QuickSearch';
import Navigation from 'components/app/Navigation';
import Modifiers from 'components/modifiers/Router';
import Domains from 'components/domains/Domains';
import Account from 'components/account/Account';
import Filters from 'components/filters/Router';
import Emails from 'components/emails/Router';

// Modules
import getView from 'lib/get-view';
import query from 'lib/parse-query-string';
import store from 'lib/store';

// Actions
import { changeView, hideWelcome } from 'actions/index';

// Constants
import { XACC, LOG_STATE, ENVIRONMENT } from 'constants/config';
import { CREATE_REDIRECT_EMAIL } from 'constants/views';
import { INITIALIZE_STATE } from 'constants/actions';

class App extends React.Component {
  constructor(props) {
    super(props);

    store.subscribe(state => this.setState(state));
    if (LOG_STATE) store.subscribe(state => console.log(state));

    const initialize = () => {
      // Access token is generated upon a successful login
      // Used to create new session without forcing login each time
      const token = localStorage.accessToken || '';

      // Access token is required
      if (!token && ENVIRONMENT != 'development') {
        location.href = XACC + 'app/#/login/service/13';
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

      request
        .get('/api/account')
        .query({ token })
        .then(res => {
          if (!res.body.loggedIn)
            return (location.href = XACC + 'app/#/login/service/13');

          state.account = res.body;

          return Promise.all([
            request.get('/api/emails'),
            request.get('/api/domains'),
            request.get('/api/filters'),
            request.get('/api/modifiers')
          ]);
        })
        .then(res => {
          state.emails = res[0].body.emails;
          state.domains = res[1].body.domains;
          state.filters = res[2].body.filters;
          state.modifiers = res[3].body.modifiers;

          // Push initial state to store
          store.dispatch({
            type: INITIALIZE_STATE,
            state
          });
          this.state = state;

          // Set state based on current url hash
          store.dispatch(changeView(getView(state)));

          // Update state according to url hash
          window.onhashchange = () => {
            // Force old hash route format to new one
            // `#${route}` -> `#/${route}`
            if (location.hash.indexOf('#/') != 0)
              return (location.hash = '#/' + location.hash.substr(1));
            store.dispatch(changeView(getView(state)));
          };
        })
        .catch(err => swal('Error', err, 'error'));
    };

    const q = query(location.hash);

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

      request
        .post('/api/account/login')
        .send(q)
        .end((err, res) => {
          if (err || res.body.error) {
            location.href = XACC + 'app/#/login/service/13';
          } else {
            localStorage.accessToken = res.body.accessToken;
            initialize();
            location.hash = location.hash.split('?')[0];
          }
        });
    } else {
      initialize();
    }
  }

  onHideWelcome() {
    store.dispatch(hideWelcome());
    localStorage.hasRun = true;
  }

  dispatch(action) {
    return store.dispatch(action);
  }

  render() {
    if (!this.state) return null;

    const { account, welcome } = this.state;

    const view = (() => {
      const props = {
        data: this.state,
        dispatch: store.dispatch,
        App: this // eventually remove other props and just use App
      };

      switch (this.state.view.split('/')[0]) {
        case 'QUICK_SEARCH':
          return <QuickSearch {...props} />;
        case 'MODIFIERS':
          return <Modifiers {...props} />;
        case 'DOMAINS':
          return <Domains {...props} />;
        case 'ACCOUNT':
          return <Account {...props} />;
        case 'FILTERS':
          return <Filters {...props} />;
        case 'EMAILS':
          return <Emails {...props} />;
        case 'DOCS':
          return <Documentation file={location.hash.split('/')[2]} />;
      }
    })();

    return (
      <div className="ptorx">
        <Navigation App={this} />

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
            rewarded when you <a href="#/account">refer</a> other users to
            Ptorx!
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

render(<App />, document.getElementById('content'));
