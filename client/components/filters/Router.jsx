import React from 'react';

// Components
import Create from './Create';
import Edit from './Edit';
import List from './List';

export default props => {
  switch (props.App.state.view.split('/')[1]) {
    case 'CREATE':
      return <Create {...props} />;
    case 'EDIT':
      return <Edit {...props} />;
    case 'LIST':
      return <List {...props} />;
  }
};
