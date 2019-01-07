import { ListItem, List } from 'react-md';
import { modifierTypes } from 'constants/types';
import { findMatching } from 'lib/find-matching';
import { Search } from 'components/misc/Search';
import * as React from 'react';

export class LinkModifier extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search: { query: '', type: 0 }
    };
  }

  render() {
    return (
      <div className="link-modifier">
        <Search onSearch={v => this.setState({ search: v })} type="modifier" />

        <List className="modifiers-list section md-paper md-paper--1">
          {findMatching(
            this.props.data.modifiers,
            this.state.search,
            this.props.ignore
          ).map(m => (
            <ListItem
              threeLines
              key={m.id}
              onClick={() => this.props.onAdd(m.id)}
              className="modifier"
              primaryText={m.name}
              secondaryText={modifierTypes[m.type] + '\n' + m.description}
            />
          ))}
        </List>
      </div>
    );
  }
}
