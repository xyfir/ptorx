import * as React from 'react';

// Components
import PurchaseCredits from 'components/account/credits/Purchase';
import PrimaryEmails from 'components/account/PrimaryEmails';
import EarnCredits from 'components/account/credits/Earn';
import Settings from 'components/account/Settings';

// Constants
import * as VIEWS from 'constants/views';

export default props => {
  switch (props.App.state.view) {
    case VIEWS.PURCHASE_CREDITS:
      return <PurchaseCredits {...props} />;
    case VIEWS.PRIMARY_EMAILS:
      return <PrimaryEmails {...props} />;
    case VIEWS.EARN_CREDITS:
      return <EarnCredits {...props} />;
    case VIEWS.SETTINGS:
      return <Settings {...props} />;
  }
};
