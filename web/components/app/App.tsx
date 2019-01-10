import { XACC, LOG_STATE, ENVIRONMENT } from 'constants/config';
import { INITIALIZE_STATE } from 'constants/actions';
import { ModifiersRouter } from 'components/modifiers/Router';
import { Documentation } from 'components/misc/Documentation';
import { AppNavigation } from 'components/app/Navigation';
import { DomainsRouter } from 'components/domains/Router';
import { AccountRouter } from 'components/account/Router';
import { FiltersRouter } from 'components/filters/Router';
import { EmailsRouter } from 'components/emails/Router';
import { QuickSearch } from 'components/app/QuickSearch';
import { Welcome } from 'components/app/Welcome';
import * as React from 'react';
import * as swal from 'sweetalert';
import { Store } from 'lib/store';
import { api } from 'lib/api';
import * as qs from 'qs';
import {
  RouteComponentProps,
  Redirect,
  Switch,
  Route,
  Link
} from 'react-router-dom';

export class App extends React.Component<RouteComponentProps> {
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
        filters: [],
        domains: [],
        emails: [],
        account: {
          credits: 0,
          emails: [],
          uid: 0
        }
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
            <Redirect from="/" to="/app/emails/create" />
          </Switch>
        </div>

        <Welcome />
      </div>
    );
  }
}
