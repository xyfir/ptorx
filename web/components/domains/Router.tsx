import { RouteComponentProps, Switch, Route } from 'react-router-dom';
import { ViewDomain } from 'components/domains/View';
import { DomainList } from 'components/domains/List';
import { AddDomain } from 'components/domains/Add';
import * as React from 'react';

export const DomainsRouter = (props: RouteComponentProps) => (
  <Switch>
    <Route
      path={`${props.match.path}/view/:domain`}
      render={p => <ViewDomain {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/create`}
      render={p => <AddDomain {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/list`}
      render={p => <DomainList {...props} {...p} />}
    />
  </Switch>
);
