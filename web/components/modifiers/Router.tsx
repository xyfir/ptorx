import { RouteComponentProps, Switch, Route } from 'react-router-dom';
import { CreateModifier } from 'components/modifiers/Create';
import { EditModifier } from 'components/modifiers/Edit';
import { ModifierList } from 'components/modifiers/List';
import * as React from 'react';

export const ModifiersRouter = (props: RouteComponentProps) => (
  <Switch>
    <Route
      path={`${props.match.path}/edit/:modifier`}
      render={p => <EditModifier {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/create`}
      render={p => <CreateModifier {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/list`}
      render={p => <ModifierList {...props} {...p} />}
    />
  </Switch>
);
