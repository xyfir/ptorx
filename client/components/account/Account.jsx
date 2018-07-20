import { SelectField, Paper } from 'react-md';
import React from 'react';

// Components
import PurchaseCredits from 'components/account/credits/Purchase';
import PrimaryEmails from 'components/account/PrimaryEmails';
import EarnCredits from 'components/account/credits/Earn';

// Constants
import * as VIEWS from 'constants/views';

export default class Account extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { view } = this.props.App.state;

    switch (view) {
      case VIEWS.PURCHASE_CREDITS:
        return <PurchaseCredits {...this.props} />;
      case VIEWS.PRIMARY_EMAILS:
        return <PrimaryEmails {...this.props} />;
      case VIEWS.EARN_CREDITS:
        return <EarnCredits {...this.props} />;
      default:
        return (
          <div className="account">
            <Paper
              zDepth={1}
              component="section"
              className="default-view section flex"
            >
              <h3>Default Page</h3>
              <p>
                Choose the page that the Ptorx application will go to when it
                first launches.
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
}
