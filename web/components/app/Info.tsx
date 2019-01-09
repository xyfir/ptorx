import { ListItem, Toolbar, Divider, Drawer, Button } from 'react-md';
import { Switch, Route, Link } from 'react-router-dom';
import { Documentation } from 'components/misc/Documentation';
import { LandingPage } from 'components/info/LandingPage';
import { Features } from 'components/info/Features';
import * as React from 'react';
import { Home } from 'components/info/Home';
import { api } from 'lib/api';
import * as qs from 'qs';

export class Info extends React.Component<
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
          <Switch>
            <Route
              path="/:path(safe-and-secure-emails|stop-unwanted-mail|anonymous-emails)"
              render={p => (
                <LandingPage
                  pwnCheck={true}
                  page={p.match.params.path}
                  {...p}
                />
              )}
            />
            <Route
              path="/:path(temporary-emails|email-forwarding)"
              render={p => <LandingPage page={p.match.params.path} {...p} />}
            />
            <Route path="/features" render={p => <Features {...p} />} />
            <Route
              path="/docs"
              render={p => <Documentation {...p} file="help" />}
            />
            <Route exact path="/" render={p => <Home {...p} />} />
            <Route
              render={() => <h2 className="status-404">Page Not Found</h2>}
            />
          </Switch>
        </div>
      </div>
    );
  }
}
