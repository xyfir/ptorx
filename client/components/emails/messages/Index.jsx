import React from 'react';

// Components
import Send from 'components/emails/messages/Send';
import View from 'components/emails/messages/View';
import List from 'components/emails/messages/List';

export default class Messages extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    switch (this.props.data.view.split('/')[2]) {
      case 'SEND':
        return <Send {...this.props} />;
      case 'VIEW':
        return <View {...this.props} />;
      case 'LIST':
        return <List {...this.props} />;
    }
  }

}