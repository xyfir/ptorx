import * as React from 'react';

// Components
import Messages from 'components/emails/messages/Router';
import Create from 'components/emails/Create';
import Edit from 'components/emails/Edit';
import List from 'components/emails/List';

export default props => {
  switch (props.App.state.view.split('/')[1]) {
    case 'MESSAGES':
      return <Messages {...props} />;
    case 'CREATE':
      return <Create {...props} />;
    case 'EDIT':
      return <Edit {...props} />;
    case 'LIST':
      return <List {...props} />;
  }
};
