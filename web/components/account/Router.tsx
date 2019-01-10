import { RouteComponentProps, Switch, Route } from 'react-router-dom';
import { PurchaseCredits } from 'components/account/credits/Purchase';
import { AccountSettings } from 'components/account/Settings';
import { EarnCredits } from 'components/account/credits/Earn';
import * as React from 'react';

export const AccountRouter = (props: RouteComponentProps) => (
  <Switch>
    <Route
      path={`${props.match.path}/credits/purchase`}
      render={p => <PurchaseCredits {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/credits/earn`}
      render={p => <EarnCredits {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/settings`}
      render={p => <AccountSettings {...props} {...p} />}
    />
  </Switch>
);
