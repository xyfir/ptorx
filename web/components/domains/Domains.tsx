import * as React from 'react';

// Components
import View from 'components/domains/View';
import List from 'components/domains/List';
import Add from 'components/domains/Add';

export default props => {
  switch (props.data.view.split('/')[1]) {
    case 'VIEW':
      return <View {...props} />;
    case 'LIST':
      return <List {...props} />;
    case 'ADD':
      return <Add {...props} />;
  }
};
