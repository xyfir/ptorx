import React from 'react';

// Components
import Send from './Send';
import View from './View';
import List from './List';

export default class Messages extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const view = (() => {
      switch (this.props.data.view.split('/')[2]) {
        case 'SEND':
          return <Send {...this.props} />;
        case 'VIEW':
          return <View {...this.props} />;
        case 'LIST':
          return <List {...this.props} />;
      }
    })();

    return <div className='old'>{view}</div>;
  }

}