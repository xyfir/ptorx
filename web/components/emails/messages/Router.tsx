import { RouteComponentProps, Switch, Route } from 'react-router-dom';
import { SendMessage } from 'components/emails/messages/Send';
import { ViewMessage } from 'components/emails/messages/View';
import { MessageList } from 'components/emails/messages/List';
import * as React from 'react';

export const MessagesRouter = (props: RouteComponentProps) => (
  <Switch>
    <Route
      path={`${props.match.path}/send`}
      render={p => <SendMessage {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/list`}
      render={p => <MessageList {...props} {...p} />}
    />
    <Route
      path={`${props.match.path}/view/:message`}
      render={p => <ViewMessage {...props} {...p} />}
    />
  </Switch>
);
