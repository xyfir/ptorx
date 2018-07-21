import { SelectField, Paper } from 'react-md';
import React from 'react';

// Constants
import * as VIEWS from 'constants/views';

export default class AccountSettings extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="account">
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
      </div>
    );
  }
}
