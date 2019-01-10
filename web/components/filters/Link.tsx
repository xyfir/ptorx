import { List, ListItem } from 'react-md';
import { findMatching } from 'lib/find-matching';
import { filterTypes } from 'constants/types';
import { Search } from 'components/common/Search';
import * as React from 'react';

export class LinkFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search: { query: '', type: 0 }
    };
  }

  render() {
    const { filters } = this.props.App.state;

    if (!filters.length)
      return (
        <span className="no-filters">You do not have any filters to link!</span>
      );

    return (
      <div className="link-filter">
        <Search onSearch={v => this.setState({ search: v })} type="filter" />

        <List className="filters-list section md-paper md-paper--1">
          {findMatching(filters, this.state.search, this.props.ignore).map(
            f => (
              <ListItem
                threeLines
                key={f.id}
                onClick={() => this.props.onAdd(f.id)}
                className="filter"
                primaryText={f.name}
                secondaryText={filterTypes[f.type] + '\n' + f.description}
              />
            )
          )}
        </List>
      </div>
    );
  }
}
