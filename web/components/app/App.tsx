import { RouteComponentProps, Redirect, Switch, Route } from 'react-router-dom';
import { XYACCOUNTS_URL, ENVIRONMENT } from 'constants/config';
import { ModifiersRouter } from 'components/modifiers/Router';
import { Documentation } from 'components/misc/Documentation';
import { AppNavigation } from 'components/app/Navigation';
import { DomainsRouter } from 'components/domains/Router';
import { AccountRouter } from 'components/account/Router';
import { FiltersRouter } from 'components/filters/Router';
import { EmailsRouter } from 'components/emails/Router';
import { QuickSearch } from 'components/app/QuickSearch';
import { AppContext } from 'lib/AppContext';
import { Welcome } from 'components/app/Welcome';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import * as swal from 'sweetalert';
import { api } from 'lib/api';
import * as qs from 'qs';

const LOGIN_URL = `${XYACCOUNTS_URL}/login/service/13`;

interface AppState {
  account?: Ptorx.Account;
}

export class App extends React.Component<RouteComponentProps, AppState> {
  state: AppState = {};

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    // Attempt to login using XID/AUTH or skip to initialize()
    const q = qs.parse(location.search);
    if (q.xid && q.auth) {
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

      try {
        const res = await api.post('/account/login', q);
        localStorage.accessToken = res.data.accessToken;
        location.search = '';
      } catch (err) {
        location.href = LOGIN_URL;
      }
    }

    // Access token is generated upon a successful login
    // Used to create new session without forcing login each time
    const token = localStorage.accessToken || '';
    if (!token && ENVIRONMENT != 'development')
      return (location.href = LOGIN_URL);

    try {
      const res = await api.get('/account', { params: { token } });
      if (!res.data.loggedIn) return (location.href = LOGIN_URL);
      this.setState({ account: res.data });
    } catch (err) {
      swal('Error', err.response.data.error, 'error');
    }
  }

  render() {
    if (!this.state.account) return null;
    const { match } = this.props;

    return (
      <div className="ptorx">
        <AppContext.Provider value={this.state}>
          <AppNavigation App={this} />

          <div className="main md-toolbar-relative">
            <Switch>
              <Route
                path={`${match.path}/quick-search`}
                render={p => <QuickSearch {...p} />}
              />
              <Route
                path={`${match.path}/modifiers`}
                render={p => <ModifiersRouter {...p} />}
              />
              <Route
                path={`${match.path}/domains`}
                render={p => <DomainsRouter {...p} />}
              />
              <Route
                path={`${match.path}/account`}
                render={p => <AccountRouter {...p} />}
              />
              <Route
                path={`${match.path}/filters`}
                render={p => <FiltersRouter {...p} />}
              />
              <Route
                path={`${match.path}/emails`}
                render={p => <EmailsRouter {...p} />}
              />
              <Route
                path={`${match.path}/docs/:file(tos|help|privacy)`}
                render={p => (
                  <Documentation file={p.match.params.file} {...p} />
                )}
              />
              <Redirect from="/" to="/app/emails/create" />
            </Switch>
          </div>

          <Welcome />
        </AppContext.Provider>
      </div>
    );
  }
}
