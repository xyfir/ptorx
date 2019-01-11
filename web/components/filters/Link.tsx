import { List, ListItem } from 'react-md';
import { findMatching } from 'lib/find-matching';
import { filterTypes } from 'constants/types';
import { Search } from 'components/common/Search';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';

interface LinkModifierProps {
  ignore?: Ptorx.FilterList;
  onAdd: (number: void) => void;
}

interface LinkFilterState {
  filters: Ptorx.FilterList;
  search: { query: string; type: number };
}

export class LinkFilter extends React.Component<
  LinkModifierProps,
  LinkFilterState
> {
  state: LinkFilterState = {
    filters: [],
    search: { query: '', type: 0 }
  };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const res = await api.get('/filters');
    this.setState({ filters: res.data });
  }

  render() {
    const { filters, search } = this.state;
    const { ignore, onAdd } = this.props;

    return !filters.length ? (
      <span className="no-filters">You do not have any filters to link!</span>
    ) : (
      <div className="link-filter">
        <Search onSearch={v => this.setState({ search: v })} type="filter" />

        <List className="filters-list section md-paper md-paper--1">
          {findMatching(filters, search, ignore).map(f => (
            <ListItem
              threeLines
              key={f.id}
              onClick={() => onAdd(f.id)}
              className="filter"
              primaryText={f.name}
              secondaryText={filterTypes[f.type] + '\n' + f.description}
            />
          ))}
        </List>
      </div>
    );
  }
}
