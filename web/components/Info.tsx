import { ListItem, Toolbar, Divider, Drawer, Button } from 'react-md';
import { render } from 'react-dom';
import * as React from 'react';
import { api } from 'lib/api';
import Blog from '@xyfir/blog';

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

  componentDidMount() {
    const q = query(location.href); // in hash or search

    for (let k in q) localStorage[k] = q[k];

    api
      .get('/account', { params: { token: localStorage.accessToken || '' } })
      .then(res => this.setState({ loggedIn: res.data.loggedIn }));
  }

  render() {
    const view = (() => {
      const paths = location.pathname.split('/');

      switch (paths[1]) {
        case 'safe-and-secure-emails':
        case 'stop-unwanted-mail':
        case 'anonymous-emails':
          return <LandingPage page={paths[1]} pwnCheck={true} />;
        case 'temporary-emails':
        case 'email-forwarding':
          return <LandingPage page={paths[1]} />;
        case 'features':
          return <Features />;
        case 'blog':
          return (
            <Blog
              post={paths.length == 6 ? paths.slice(2).join('/') : null}
              groups={['ptorx']}
              repository="Xyfir/blog-posts"
              linkFormat="/blog/{{post.id}}"
              titleFormat={['Blog – Ptorx', '{{post.title}} – Blog – Ptorx']}
              descriptionFormat={[
                'Read about email security and privacy on the Ptorx blog.',
                '{{post.description}}'
              ]}
            />
          );
        case 'docs':
          return <Documentation file="help" />;
        case '':
          return <Home />;
        default:
          return <h2 className="status-404">Page Not Found</h2>;
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
                <a href="/app/">
                  <ListItem primaryText="App" />
                </a>
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

            <a href="/features">
              <ListItem primaryText="Feature List" />
            </a>,
            <a href="/docs">
              <ListItem primaryText="Help Docs" />
            </a>,
            <a href="/blog/">
              <ListItem primaryText="Blog" />
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
