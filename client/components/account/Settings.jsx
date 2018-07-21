import { SelectField, Paper } from 'react-md';
import request from 'superagent';
import React from 'react';

// Actions
import { setEmailTemplate } from 'actions/account';

// Constants
import * as VIEWS from 'constants/views';

export default class AccountSettings extends React.Component {
  constructor(props) {
    super(props);
  }

  /** @param {number} id */
  onSetEmailTemplate(id) {
    request
      .put('/api/account/email/template')
      .send({ id })
      .end(err => {
        if (err) return;
        this.props.App.dispatch(setEmailTemplate(id));
      });
  }

  render() {
    const { App } = this.props;

    return (
      <div className="account-settings">
        <Paper
          zDepth={1}
          component="section"
          className="default-view section flex"
        >
          <h3>Default Page</h3>
          <p>
            Choose the page that the Ptorx application will go to when it first
            launches.
          </p>

          <SelectField
            id="select--default-page"
            label="Page"
            onChange={v => (localStorage.defaultView = v)}
            className="md-full-width"
            menuItems={[
              {
                label: 'Quick Search',
                value: VIEWS.QUICK_SEARCH
              },
              {
                label: 'Email-Only Search',
                value: VIEWS.LIST_REDIRECT_EMAILS
              },
              {
                label: 'Create Proxy Email',
                value: VIEWS.CREATE_REDIRECT_EMAIL
              }
            ]}
            defaultValue={
              localStorage.defaultView || VIEWS.CREATE_REDIRECT_EMAIL
            }
          />
        </Paper>

        <Paper
          zDepth={1}
          component="section"
          className="email-template section flex"
        >
          <h3>Email Template</h3>
          <p>
            Choose the proxy email whose data will be used as a template
            whenever you create a new proxy email.
          </p>

          <SelectField
            id="select-email"
            label="Select Email"
            onChange={v => this.onSetEmailTemplate(v)}
            className="md-full-width"
            menuItems={[{ value: null, label: 'None' }].concat(
              App.state.emails.map(e => ({
                value: e.id,
                label: e.address
              }))
            )}
            defaultValue={App.state.account.email_template}
          />
        </Paper>
      </div>
    );
  }
}
