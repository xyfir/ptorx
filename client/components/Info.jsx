import { render } from 'react-dom';
import React from 'react';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import Drawer from 'react-md/lib/Drawers';
import Button from 'react-md/lib/Buttons/Button';

// Components
import LandingPage from 'components/info/LandingPage';
import HelpDocs from 'components/misc/HelpDocs';
import Features from 'components/info/Features';
import Home from 'components/info/Home';

// Modules
import query from 'lib/parse-hash-query';

class PtorxInfo extends React.Component {

  constructor(props) {
    super(props);

    this.state = { drawer: false };
  }

  componentWillMount() {
    const q = query();
    for (let k in q) localStorage[k] = q[k];
  }

  render() {
    const view = (() => {
      const section = location.pathname.split('/')[1];

      switch (section) {
        case 'safe-and-secure-emails':
        case 'stop-unwanted-mail':
        case 'anonymous-emails':
        case 'temporary-emails':
        case 'email-forwarding':
          return <LandingPage section={section} />
        case 'features':
          return <Features />
        case 'docs':
          return <HelpDocs />
        default:
          return <Home />
      }
    })();
    
    return (
      <div className='ptorx-info'>
        <Toolbar
          colored fixed
          actions={[
            <Button
              icon
              iconChildren='home'
              onClick={() => location.href = '../'}
            />
          ]}
          title='Ptorx'
          nav={
            <Button
              icon
              iconChildren='menu'
              onClick={() => this.setState({ drawer: true })}
            />
          }
        />

        <Drawer
          onVisibilityChange={v => this.setState({ drawer: v })}
          autoclose={true}
          navItems={[
            <a href='panel/'>
              <ListItem primaryText='App' />
            </a>,
            <a href='https://accounts.xyfir.com/app/#/login/13'>
              <ListItem primaryText='Login' />
            </a>,
            <a href='https://accounts.xyfir.com/app/#/register/13'>
              <ListItem primaryText='Register' />
            </a>,

            <Divider />,

            <a href='features'>
              <ListItem primaryText='Feature List' />
            </a>,
            <a href='docs'>
              <ListItem primaryText='Help Docs' />
            </a>
          ]}
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  iconChildren='arrow_back'
                  onClick={() => this.setState({ drawer: false })}
                />
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />

        <div className='main md-toolbar-relative'>{view}</div>
      </div>
    );
  }

}

render(<PtorxInfo />, document.getElementById('content'));