import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';
import * as React from 'react';
import { theme } from 'constants/theme';
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

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    api
      .get('/account')
      .then(res => this.setState({ user: res.data, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  render() {
    const { loading, user } = this.state;
    if (loading) return null;
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route path="/info" render={() => <Info user={user} />} />
            {user ? (
              <Route path="/app" render={() => <Panel user={user} />} />
            ) : (
              <Redirect from="/app" to="/info" />
            )}
            <Redirect exact from="/" to="/info" />
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}
