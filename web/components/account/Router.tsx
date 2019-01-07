import * as React from 'react';

// Components
import { PurchaseCredits } from 'components/account/credits/Purchase';
import { AccountSettings } from 'components/account/Settings';
import { PrimaryEmails } from 'components/account/PrimaryEmails';
import { EarnCredits } from 'components/account/credits/Earn';

// Constants
import * as VIEWS from 'constants/views';

export const AccountRouter = props => {
  switch (props.App.state.view) {
    case VIEWS.PURCHASE_CREDITS:
      return <PurchaseCredits {...props} />;
    case VIEWS.PRIMARY_EMAILS:
      return <PrimaryEmails {...props} />;
    case VIEWS.EARN_CREDITS:
      return <EarnCredits {...props} />;
    case VIEWS.SETTINGS:
      return <AccountSettings {...props} />;
  }
};
