import * as React from 'react';

// Components
import Send from 'components/emails/messages/Send';
import View from 'components/emails/messages/View';
import List from 'components/emails/messages/List';

export default props => {
  switch (props.App.state.view.split('/')[2]) {
    case 'SEND':
      return <Send {...props} />;
    case 'VIEW':
      return <View {...props} />;
    case 'LIST':
      return <List {...props} />;
  }
};
