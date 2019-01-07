import { ViewDomain } from 'components/domains/View';
import { DomainList } from 'components/domains/List';
import { AddDomain } from 'components/domains/Add';
import * as React from 'react';

export const DomainsRouter = props => {
  switch (props.data.view.split('/')[1]) {
    case 'VIEW':
      return <ViewDomain {...props} />;
    case 'LIST':
      return <DomainList {...props} />;
    case 'ADD':
      return <AddDomain {...props} />;
  }
};
