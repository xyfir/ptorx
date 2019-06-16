import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import * as React from 'react';
import { theme } from 'lib/theme';
import { Panel } from 'components/panel/Panel';
import { Ptorx } from 'types/ptorx';
import { Info } from 'components/info/Info';
import { api } from 'lib/api';

interface AppState {
  loading: boolean;
  user?: Ptorx.User;
}

export class App extends React.Component<{}, AppState> {
  state: AppState = { loading: true };

  componentDidMount() {
    if (location.search.startsWith('?r='))
      localStorage.r = location.search.substr(3);

    api
      .get('/users')
      .then(res => this.setState({ user: res.data, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  render() {
    const { loading, user } = this.state;
    if (loading) return null;
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route path="/info" render={() => <Info user={user} />} />
            {user ? (
              <Route path="/app" render={() => <Panel user={user} />} />
            ) : (
              <Route
                path="/app"
                render={() => (
                  location.replace(process.enve.ACCOWNT_WEB_URL), null
                )}
              />
            )}
            <Redirect exact from="/" to="/info" />
          </Switch>
        </BrowserRouter>
      </ThemeProvider>
    );
  }
}
