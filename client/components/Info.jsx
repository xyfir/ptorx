import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import Drawer from 'react-md/lib/Drawers';
import Button from 'react-md/lib/Buttons/Button';

// Components
import Documentation from 'components/misc/Documentation';
import LandingPage from 'components/info/LandingPage';
import Features from 'components/info/Features';
import Home from 'components/info/Home';

// Modules
import query from 'lib/parse-query-string';

class PtorxInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = { drawer: false, loggedIn: false };
  }

  componentWillMount() {
    const q = query(location.href); // in hash or search

    for (let k in q) localStorage[k] = q[k];

    request
      .get('/api/account')
      .query({ token: localStorage.accessToken || '' })
      .end(
        (err, res) => !err && this.setState({ loggedIn: res.body.loggedIn })
      );
  }

  render() {
    const view = (() => {
      const page = location.pathname.split('/')[1];

      switch (page) {
        case 'safe-and-secure-emails':
        case 'stop-unwanted-mail':
        case 'anonymous-emails':
          return <LandingPage page={page} pwnCheck={true} />;
        case 'temporary-emails':
        case 'email-forwarding':
          return <LandingPage page={page} />;
        case 'features':
          return <Features />;
        case 'docs':
          return <Documentation file="help" />;
        case '':
          return <Home />;
        default:
          return <h2 className="status-404">404: Page Not Found</h2>;
      }
    })();

    return (
      <div className="ptorx-info">
        <Toolbar
          colored
          fixed
          actions={[
            <Button
              icon
              iconChildren="home"
              onClick={() => (location.href = '../')}
            />
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
                <a href="app/">
                  <ListItem primaryText="App" />
                </a>
              ]
            : [
                <a href="https://accounts.xyfir.com/app/#/login/13">
                  <ListItem primaryText="Login" />
                </a>,
                <a href="https://accounts.xyfir.com/app/#/register/13">
                  <ListItem primaryText="Register" />
                </a>
              ]
          ).concat([
            <Divider />,

            <a href="features">
              <ListItem primaryText="Feature List" />
            </a>,
            <a href="docs">
              <ListItem primaryText="Help Docs" />
            </a>
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

        <div className="main md-toolbar-relative">{view}</div>
      </div>
    );
  }
}

render(<PtorxInfo />, document.getElementById('content'));
