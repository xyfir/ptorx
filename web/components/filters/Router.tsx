import { RouteComponentProps, Switch, Route } from 'react-router-dom';
import { CreateFilter } from 'components/filters/Create';
import { EditFilter } from 'components/filters/Edit';
import { FilterList } from 'components/filters/List';
import * as React from 'react';

export const FiltersRouter = (props: RouteComponentProps) => (
  <Switch>
    <Route
      path={`${props.match.path}/edit/:filter`}
      render={p => <EditFilter {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/create`}
      render={p => <CreateFilter {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/list`}
      render={p => <FilterList {...props} {...p} />}
    />
  </Switch>
);
