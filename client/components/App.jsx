import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

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
import Domains from 'components/domains/Domains';
import Account from 'components/account/Account';
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
      const token = localStorage.accessToken || '';

      // Access token is required
      if (!token && ENVIRONMENT != 'dev') {
        location.href = XACC + 'app/#/login/service/13';
      }

      const state = {
        modifiers: [], filters: [], domains: [], emails: [], messages: [],
        drawer: false, view: CREATE_REDIRECT_EMAIL,
        account: {
          emails: [], uid: 0, subscription: 0
        }
      };

      request
        .get('/api/account')
        .query({ token })
        .then(res => {
          if (!res.body.loggedIn)
            return location.href = XACC + 'app/#/login/service/13';

          state.account = res.body;

          return request.get('/api/domains');
        })
        .then(res => {
          state.domains = res.body.domains;
          return request.get('/api/emails');
        })
        .then(res => {
          state.emails = res.body.emails;
          return request.get('/api/filters');
        })
        .then(res => {
          state.filters = res.body.filters;
          return request.get('/api/modifiers');
        })
        .then(res => {
          state.modifiers = res.body.modifiers;

          // Push initial state to store
          store.dispatch({
            type: INITIALIZE_STATE, state
          });
          this.state = state;

          // Set state based on current url hash
          setState(store);
          
          // Update state according to url hash
          window.onhashchange = () => {
            // Force old hash route format to new one
            // `#${route}` -> `#/${route}`
            if (location.hash.indexOf('#/') != 0)
              return location.hash = '#/' + location.hash.substr(1);
            setState(store);
          }
        })
        .catch(err => swal('Error', err, 'error'));
    };

    const q = parseHashQuery();

    // PhoneGap app opens to ptorx.com/panel/#?phonegap=1
    if (q.phonegap) {
      localStorage.isPhoneGap = true;
      initialize();
      location.hash = '';
    }
    // Attempt to login using XID/AUTH or skip to initialize()
    else if (q.xid && q.auth) {
      q.affiliate = localStorage.affiliate || '',
      q.referral = localStorage.referral || '';
      
      request
        .post('/api/account/login')
        .send(q)
        .end((err, res) => {
          if (err || res.body.error) {
            location.href = XACC + 'app/#/login/service/13';
          }
          else {
            localStorage.accessToken = res.body.accessToken;
            initialize();
            location.hash = location.hash.split('?')[0];
          }
        })
    }
    else {
      initialize();
    }
  }

  onLogout() {
    delete localStorage.accessToken;
    location.href = '/api/account/logout';
  }

  dispatch(action) {
    return store.dispatch(action);
  }

  render() {
    if (!this.state) return <div />;
    
    const view = (() => {
      const props = {
        data: this.state, dispatch: store.dispatch,
        App: this // eventually remove other props and just use App
      };

      switch (this.state.view.split('/')[0]) {
        case 'MODIFIERS': return <Modifiers {...props} />
        case 'DOMAINS': return <Domains {...props} />
        case 'ACCOUNT': return <Account {...props} />
        case 'FILTERS': return <Filters {...props} />
        case 'EMAILS': return <Emails {...props} />
        case 'DOCS': return <HelpDocs />
      }
    })();
    
    return (
      <div className='ptorx'>
        <Toolbar
          colored fixed
          actions={[
            <Button
              icon
              iconChildren='home'
              onClick={() => location.hash = '#'}
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
            <a href='#/account'>
              <ListItem primaryText='Account' />
            </a>,
            <a href='#/emails/list'>
              <ListItem primaryText='Proxy Emails' />
            </a>,
            <a href='#/filters/list'>
              <ListItem primaryText='Filters' />
            </a>,
            <a href='#/modifiers/list'>
              <ListItem primaryText='Modifiers' />
            </a>,
            <a href='#/domains'>
              <ListItem primaryText='Domains' />
            </a>,

            <Divider />,

            <a href='https://xyfir.com/#/contact'>
              <ListItem primaryText='Contact Us' />
            </a>,
            <a href='#/docs'>
              <ListItem primaryText='Help Docs' />
            </a>,
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
                  iconChildren='arrow_back'
                  onClick={() => this.setState({ drawer: false })}
                />
              }
            />
          }
          type={Drawer.DrawerTypes.TEMPORARY}
        />

        <div className='main md-toolbar-relative'>
          {this.state.account.trial ? (
            <p className='trial'>
              Your account is currently in trial mode. Some limitations apply.
              <Button
                icon
                iconChildren='info'
                href='#/docs?section=free-trial'
              />
            </p>    
          ) : null}

          {view}
        </div>
      </div>
    );
  }

}

render(<App />, document.getElementById('content'));