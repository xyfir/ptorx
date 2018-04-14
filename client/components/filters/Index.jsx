import React from 'react';

// Components
import Create from './Create';
import Edit from './Edit';
import List from './List';

export default class Filters extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    switch (this.props.data.view.split('/')[1]) {
      case 'CREATE':
        return <Create data={this.props.data} dispatch={this.props.dispatch} />;
      case 'EDIT':
        return <Edit data={this.props.data} dispatch={this.props.dispatch} />;
      case 'LIST':
        return <List data={this.props.data} dispatch={this.props.dispatch} />;
    }
  }
}
