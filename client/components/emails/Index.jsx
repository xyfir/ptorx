import React from 'react';

// Components
import Messages from 'components/emails/messages/Index';
import Create from 'components/emails/Create';
import Edit from 'components/emails/Edit';
import List from 'components/emails/List';

export default class Emails extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    switch (this.props.App.state.view.split('/')[1]) {
      case 'MESSAGES':
        return <Messages {...this.props} />;
      case 'CREATE':
        return <Create {...this.props} />;
      case 'EDIT':
        return <Edit {...this.props} />;
      case 'LIST':
        return <List {...this.props} />;
    }
  }
}
