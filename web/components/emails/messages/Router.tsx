import { SendMessage } from 'components/emails/messages/Send';
import { ViewMessage } from 'components/emails/messages/View';
import { MessageList } from 'components/emails/messages/List';
import * as React from 'react';

export const MessagesRouter = props => {
  switch (props.App.state.view.split('/')[2]) {
    case 'SEND':
      return <SendMessage {...props} />;
    case 'VIEW':
      return <ViewMessage {...props} />;
    case 'LIST':
      return <MessageList {...props} />;
  }
};
