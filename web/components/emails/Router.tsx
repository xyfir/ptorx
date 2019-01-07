import * as React from 'react';

import { MessagesRouter } from 'components/emails/messages/Router';
import { CreateEmail } from 'components/emails/Create';
import { EditEmail } from 'components/emails/Edit';
import { EmailList } from 'components/emails/List';

export const EmailsRouter = props => {
  switch (props.App.state.view.split('/')[1]) {
    case 'MESSAGES':
      return <MessagesRouter {...props} />;
    case 'CREATE':
      return <CreateEmail {...props} />;
    case 'EDIT':
      return <EditEmail {...props} />;
    case 'LIST':
      return <EmailList {...props} />;
  }
};
