import { CreateModifier } from 'components/modifiers/Create';
import { UpdateModifier } from 'components/modifiers/Edit';
import { ModifierList } from 'components/modifiers/List';
import * as React from 'react';

export const ModifiersRouter = props => {
  switch (props.App.state.view.split('/')[1]) {
    case 'CREATE':
      return <CreateModifier {...props} />;
    case 'EDIT':
      return <UpdateModifier {...props} />;
    case 'LIST':
      return <ModifierList {...props} />;
  }
};
