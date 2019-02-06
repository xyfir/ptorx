import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { AppContext } from 'lib/AppContext';
import * as React from 'react';
import { theme } from 'constants/theme';
import { Panel } from 'components/panel/Panel';
import { Ptorx } from 'typings/ptorx';
import { Info } from 'components/info/Info';
import { api } from 'lib/api';

export interface AppState {
  primaryEmails: Ptorx.PrimaryEmailList;
  proxyEmails: Ptorx.ProxyEmailList;
  modifiers: Ptorx.ModifierList;
  messages: Ptorx.MessageList;
  filters: Ptorx.FilterList;
  domains: Ptorx.DomainList;
  loading: boolean;
  user?: Ptorx.User;
}

export class App extends React.Component<{}, AppState> {
  state: AppState = {
    primaryEmails: [],
    proxyEmails: [],
    modifiers: [],
    messages: [],
    filters: [],
    domains: [],
    loading: true
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    api
      .get('/account')
      .then(res => {
        this.setState({ user: res.data, loading: false });
        this.reload();
      })
      .catch(err => this.setState({ loading: false }));
  }

  reload() {
    Promise.all([
      api.get('/primary-emails'),
      api.get('/proxy-emails'),
      api.get('/modifiers'),
      api.get('/messages'),
      api.get('/filters'),
      api.get('/domains')
    ])
      .then(res =>
        this.setState({
          primaryEmails: res[0].data,
          proxyEmails: res[0].data,
          modifiers: res[0].data,
          messages: res[0].data,
          filters: res[0].data,
          domains: res[0].data
        })
      )
      .catch(console.error);
  }

  render() {
    const { loading, user } = this.state;
    if (loading) return null;
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppContext.Provider value={{ ...this.state, reload: this.reload }}>
            <Switch>
              <Route path="/info" component={Info} />
              {user ? (
                <Route path="/app" component={Panel} />
              ) : (
                <Redirect from="/app" to="/info" />
              )}
              <Redirect exact from="/" to="/info" />
            </Switch>
          </AppContext.Provider>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}
