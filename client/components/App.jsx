import 'babel-polyfill';

import { render } from 'react-dom';
import { Button } from 'react-md';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Components
import Documentation from 'components/misc/Documentation';
import QuickSearch from 'components/app/QuickSearch';
import Navigation from 'components/app/Navigation';
import Modifiers from 'components/modifiers/Index';
import Domains from 'components/domains/Domains';
import Account from 'components/account/Account';
import Filters from 'components/filters/Index';
import Emails from 'components/emails/Index';

// Modules
import getView from 'lib/get-view';
import query from 'lib/parse-query-string';
import store from 'lib/store';

// Actions
import { changeView } from 'actions/creators/index';

// Constants
import { XACC, LOG_STATE, ENVIRONMENT } from 'constants/config';
import { CREATE_REDIRECT_EMAIL, QUICK_SEARCH } from 'constants/views';
import { INITIALIZE_STATE } from 'actions/types/index';

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
        filters: [],
        domains: [],
        emails: [],
        messages: [],
        view: CREATE_REDIRECT_EMAIL,
        account: {
          emails: [],
          uid: 0,
          subscription: 0
        }
      };

      request
        .get('/api/account')
        .query({ token })
        .then(res => {
          if (!res.body.loggedIn)
            return (location.href = XACC + 'app/#/login/service/13');

          state.account = res.body;

          return request.get('/api/domains');
        })
        .then(res => {
          state.domains = res.body.domains;
          return request.get('/api/emails');
        })
        .then(res => {
          state.emails = res.body.emails;
          return request.get('/api/filters');
        })
        .then(res => {
          state.filters = res.body.filters;
          return request.get('/api/modifiers');
        })
        .then(res => {
          state.modifiers = res.body.modifiers;

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

  dispatch(action) {
    return store.dispatch(action);
  }

  render() {
    if (!this.state) return null;

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

        <div className="main md-toolbar-relative">
          {this.state.account.trial ? (
            <p className="trial">
              Your account is currently in trial mode. Some limitations apply.
              <Button
                icon
                iconChildren="info"
                href="#/docs?section=free-trial"
              />
            </p>
          ) : null}

          {view}
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('content'));
