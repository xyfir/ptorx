import { CreateFilter } from 'components/filters/Create';
import { EditFilter } from 'components/filters/Edit';
import { FilterList } from 'components/filters/List';
import * as React from 'react';

export const FiltersRouter = props => {
  switch (props.App.state.view.split('/')[1]) {
    case 'CREATE':
      return <CreateFilter {...props} />;
    case 'EDIT':
      return <EditFilter {...props} />;
    case 'LIST':
      return <FilterList {...props} />;
  }
};
