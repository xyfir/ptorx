import { RouteComponentProps, Switch, Route, Link } from 'react-router-dom';
import { XACC, LOG_STATE, ENVIRONMENT } from 'constants/config';
import { Button, DialogContainer } from 'react-md';
import { CREATE_REDIRECT_EMAIL } from 'constants/views';
import { INITIALIZE_STATE } from 'constants/actions';
import { ModifiersRouter } from 'components/modifiers/Router';
import { Documentation } from 'components/misc/Documentation';
import { AppNavigation } from 'components/app/Navigation';
import { DomainsRouter } from 'components/domains/Router';
import { AccountRouter } from 'components/account/Router';
import { FiltersRouter } from 'components/filters/Router';
import { EmailsRouter } from 'components/emails/Router';
import { QuickSearch } from 'components/app/QuickSearch';
import { hideWelcome } from 'actions/index';
import * as React from 'react';
import * as swal from 'sweetalert';
import { Store } from 'lib/store';
import { hot } from 'react-hot-loader';
import { api } from 'lib/api';
import * as qs from 'qs';

class _App extends React.Component<{}, RouteComponentProps> {
  constructor(props) {
    super(props);

    Store.subscribe(state => this.setState(state));
    if (LOG_STATE) Store.subscribe(state => console.log(state));

    const initialize = async () => {
      // Access token is generated upon a successful login
      // Used to create new session without forcing login each time
      const token = localStorage.accessToken || '';

      // Access token is required
      if (!token && ENVIRONMENT != 'development')
        return (location.href = `${XACC}/login/service/13`);

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
          if (!res.data.loggedIn)
            return (location.href = `${XACC}/login/service/13`);

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
          Store.dispatch({ type: INITIALIZE_STATE, state });
        })
        .catch(err => swal('Error', err.response.data.error, 'error'));
    };

    const q = qs.parse(location.search);

    if (q.phonegap) {
      localStorage.isPhoneGap = true;
      initialize();
      location.search = '';
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
          location.search = '';
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
    const { match } = this.props;
    const props = {
      dispatch: Store.dispatch,
      data: this.state,
      App: this // eventually remove other props and just use App
    };

    return (
      <div className="ptorx">
        <AppNavigation App={this} />

        <div className="main md-toolbar-relative">
          <Switch>
            <Route
              path={`${match.path}/quick-search`}
              render={p => <QuickSearch {...props} {...p} />}
            />
            <Route
              path={`${match.path}/modifiers`}
              render={p => <ModifiersRouter {...props} {...p} />}
            />
            <Route
              path={`${match.path}/domains`}
              render={p => <DomainsRouter {...props} {...p} />}
            />
            <Route
              path={`${match.path}/account`}
              render={p => <AccountRouter {...props} {...p} />}
            />
            <Route
              path={`${match.path}/filters`}
              render={p => <FiltersRouter {...props} {...p} />}
            />
            <Route
              path={`${match.path}/emails`}
              render={p => <EmailsRouter {...props} {...p} />}
            />
            <Route
              path={`${match.path}/docs/:file(tos|help|privacy)`}
              render={p => (
                <Documentation file={p.match.params.file} {...props} {...p} />
              )}
            />
          </Switch>
        </div>

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
            Credits can be{' '}
            <Link to="/app/account/credits/purchase">purchased</Link>, or{' '}
            <Link to="/app/account/credits/earn">earned</Link>, and are also
            rewarded when you <Link to="/app/account/credits/earn">refer</Link>{' '}
            other users to Ptorx!
          </p>
          <p>
            If you're ever feeling confused, open the app menu and check out the{' '}
            <Link to="/app/docs/help">Help Docs</Link>!
          </p>
          <Button primary raised onClick={() => this.onHideWelcome()}>
            Got it, thanks!
          </Button>
        </DialogContainer>
      </div>
    );
  }
}

export const App = hot(module)(_App);
