import { ListItem, List } from 'react-md';
import { modifierTypes } from 'constants/types';
import { findMatching } from 'lib/find-matching';
import { Search } from 'components/common/Search';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';

interface LinkModifierProps {
  ignore?: Ptorx.ModifierList;
  onAdd: (number: void) => void;
}

interface LinkModifierState {
  modifiers: Ptorx.ModifierList;
  search: {
    query: string;
    type: number;
  };
}

export class LinkModifier extends React.Component<
  LinkModifierProps,
  LinkModifierState
> {
  state: LinkModifierState = {
    modifiers: [],
    search: { query: '', type: 0 }
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    api.get('/modifiers').then(res => this.setState({ modifiers: res.data }));
  }

  render() {
    return (
      <div className="link-modifier">
        <Search onSearch={v => this.setState({ search: v })} type="modifier" />

        <List className="modifiers-list section md-paper md-paper--1">
          {findMatching(
            this.state.modifiers,
            this.state.search,
            this.props.ignore
          ).map(m => (
            <ListItem
              key={m.id}
              onClick={() => this.props.onAdd(m.id)}
              className="modifier"
              primaryText={m.name}
              secondaryText={modifierTypes[m.type]}
            />
          ))}
        </List>
      </div>
    );
  }
}
