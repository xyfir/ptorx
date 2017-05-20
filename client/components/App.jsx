import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';

// Redux store / reducers
import { createStore } from 'redux';
import reducers from 'reducers/index';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import Drawer from 'react-md/lib/Drawers';
import Button from 'react-md/lib/Buttons/Button';

// Components
import Modifiers from 'components/modifiers/Index';
import HelpDocs from 'components/misc/HelpDocs';
import Account from 'components/account/Index';
import Filters from 'components/filters/Index';
import Emails from 'components/emails/Index';

// Modules
import parseHashQuery from 'lib/parse-hash-query';
import setState from 'lib/set-state';

// Constants
import { URL, XACC, LOG_STATE, ENVIRONMENT } from 'constants/config';
import { CREATE_REDIRECT_EMAIL } from 'constants/views';
import { INITIALIZE_STATE } from 'actions/types/index';

const store = createStore(reducers);

class App extends React.Component {

  constructor(props) {
    super(props);

    store.subscribe(() => this.setState(store.getState()));

    if (LOG_STATE) {
      store.subscribe(() => console.log(store.getState()));
    }

    const initialize = () => {
      // Access token is generated upon a successful login
      // Used to create new session without forcing login each time
      const token = localStorage.getItem('access_token') || '';

      // Access token is required
      if (!token && ENVIRONMENT != 'dev') {
        location.href = XACC + 'app/#/login/13';
      }

      const state = {
        view: CREATE_REDIRECT_EMAIL, modifiers: [], filters: [], emails: [],
        drawer: false, account: {
          emails: [], subscription: 0
        },
      };

      request
        .get('../api/account')
        .query({ token })
        .end((err, res) => {
          if (err || !res.body.loggedIn) {
            location.href = XACC + 'app/#/login/13';
          }
          else {
            state.account = res.body;

            this.state = state;

            // Push initial state to store
            store.dispatch({
              type: INITIALIZE_STATE, state
            });

            // Set state based on current url hash
            setState(store);
            
            // Update state according to url hash
            window.onhashchange = () => setState(store);
          }
        });
    };

    const q = parseHashQuery();

    // PhoneGap app opens to ptorx.com/panel/#?phonegap=1
    if (q.phonegap) {
      localStorage.setItem('isPhoneGap', 'true');
      initialize();
      location.hash = '';
    }
    // Attempt to login using XID/AUTH or skip to initialize()
    else if (q.xid && q.auth) {
      q.affiliate = localStorage.getItem('affiliate') || '';
      q.referral = localStorage.getItem('referral') || '';
      
      request
        .post('../api/account/login')
        .send(q)
        .end((err, res) => {
          if (err || res.body.error) {
            location.href = XACC + 'app/#/login/13';
          }
          else {
            localStorage.setItem('access_token', res.body.accessToken);
            initialize();
            location.hash = location.hash.split('?')[0];
          }
        })
    }
    else {
      initialize();
    }
  }

  onShowTrialInfo() {
    swal({
      title: 'Free Trial',
      text: `
        To prevent abuse to our system, some restrictions are placed on free trial users:
        <ol>
          <li>Limited to creating up to 5 proxy emails a day</li>
          <li>Limited to creating up to 15 proxy emails total</li>
          <li>Must complete a verification captcha before creating a proxy email</li>
          <li>Cannot have more than one main email address</li>
          <li>Cannot send messages or reply to received mail</li>
        </ol>
        These restrictions can be removed by purchasing a subscription.
      `,
      html: true
    });
  }

  onLogout() {
    delete localStorage.access_token;
    location.href = '../api/account/logout';
  }

  render() {
    if (!this.state) return <div />;
    
    const view = (() => {
      switch (this.state.view.split('/')[0]) {
        case 'MODIFIERS':
          return <Modifiers data={this.state} dispatch={store.dispatch} />;
        case 'ACCOUNT':
          return <Account data={this.state} dispatch={store.dispatch} />;
        case 'FILTERS':
          return <Filters data={this.state} dispatch={store.dispatch} />;
        case 'EMAILS':
          return <Emails data={this.state} dispatch={store.dispatch} />;
      }
    })();
    
    return (
      <div className='ptorx'>
        <Toolbar
          colored fixed
          actions={[
            <Button
              icon
              onClick={() => location.hash = '#'}
            >home</Button>
          ]}
          title='Ptorx'
          nav={
            <Button
              icon
              onClick={() => this.setState({ drawer: true })}
            >menu</Button>
          }
        />

        <Drawer
          onVisibilityToggle={v => this.setState({ drawer: v })}
          autoclose={true}
          navItems={[
            <a href='#account'>
              <ListItem primaryText='Account' />
            </a>,
            <a href='#emails/list'>
              <ListItem primaryText='Proxy Emails' />
            </a>,
            <a href='#filters/list'>
              <ListItem primaryText='Filters' />
            </a>,
            <a href='#modifiers/list'>
              <ListItem primaryText='Modifiers' />
            </a>,
            <Divider />,
            <a onClick={() => this.onLogout()}>
              <ListItem primaryText='Logout' />
            </a>
          ]}
          visible={this.state.drawer}
          header={
            <Toolbar
              colored
              nav={
                <Button
                  icon
                  onClick={() => this.setState({ drawer: false })}
                >arrow_back</Button>
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />

        <div className='main md-toolbar-relative'>
          {this.state.account.trial ? (
            <div className='trial'>
              <strong>Your account is currently in trial mode.</strong> Some limitations apply.
              <a
                className='icon-info'
                onClick={() => this.onShowTrialInfo()}
              />
            </div>    
          ) : null}

          {view}
        </div>

        <HelpDocs />
      </div>                
    );
  }

}

render(<App />, document.getElementById('content'));