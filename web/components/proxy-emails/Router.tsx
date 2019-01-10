import { RouteComponentProps, Switch, Route } from 'react-router-dom';
import { MessagesRouter } from 'components/proxy-emails/messages/Router';
import { CreateEmail } from 'components/proxy-emails/Create';
import { EditEmail } from 'components/proxy-emails/Edit';
import { EmailList } from 'components/proxy-emails/List';
import * as React from 'react';

export const EmailsRouter = (props: RouteComponentProps) => (
  <Switch>
    <Route
      path={`${props.match.path}/messages/:email`}
      render={p => <MessagesRouter {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/edit/:email`}
      render={p => <EditEmail {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/create`}
      render={p => <CreateEmail {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/list`}
      render={p => <EmailList {...props} {...p} />}
    />
  </Switch>
);
