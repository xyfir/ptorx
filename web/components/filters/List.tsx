import { List, Button, DialogContainer, ListItem } from 'react-md';
import { RouteComponentProps, Link } from 'react-router-dom';
import { LocalPagination } from 'components/common/Pagination';
import { findMatching } from 'lib/find-matching';
import { filterTypes } from 'constants/types';
import { Search } from 'components/common/Search';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

interface FilterListState {
  filters: Ptorx.FilterList;
  filter: number;
  search: {
    query: string;
    type: number;
  };
  page: number;
}

export class FilterList extends React.Component<
  RouteComponentProps,
  FilterListState
> {
  state: FilterListState = {
    filter: 0,
    search: { query: '', type: 0 },
    page: 1
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.load();
  }

  async onDelete() {
    const { filter } = this.state;

    const confirm = await swal({
      buttons: true,
      title: 'Are you sure?',
      text: 'This filter will be removed from any emails it is linked to.',
      icon: 'warning'
    });
    if (!confirm) return;

    api
      .delete(`/filters/${filter}`)
      .then(res => {
        this.setState({ filter: 0 });
        this.load();
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onEdit() {
    this.props.history.push(`/app/filters/edit/${this.state.filter}`);
  }

  async load() {
    const res = await api.get('/filters');
    this.setState({ filters: res.data });
  }

  render() {
    const { filters, filter, search, page } = this.state;
    return (
      <div className="filters">
        <Link to="/app/filters/create">
          <Button
            floating
            fixed
            primary
            tooltipPosition="left"
            tooltipLabel="Create new filter"
            iconChildren="add"
          />
        </Link>

        <Search onSearch={v => this.setState({ search: v })} type="filter" />

        <List className="filters-list section md-paper md-paper--1">
          {findMatching(filters, search)
            .filter(f => !f.global)
            .splice((page - 1) * 25, 25)
            .map(f => (
              <ListItem
                key={f.id}
                onClick={() => this.setState({ filter: f.id })}
                className="filter"
                primaryText={f.name}
                secondaryText={filterTypes[f.type]}
              />
            ))}
        </List>

        <LocalPagination
          itemsPerPage={25}
          onGoTo={p => this.setState({ page: p })}
          items={filters.length}
          page={page}
        />

        <DialogContainer
          id="selected-filter"
          title={filter && filters.find(f => f.id == this.state.filter).name}
          onHide={() => this.setState({ filter: 0 })}
          visible={!!filter}
        >
          <List>
            <ListItem primaryText="Edit" onClick={() => this.onEdit()} />
            <ListItem primaryText="Delete" onClick={() => this.onDelete()} />
          </List>
        </DialogContainer>
      </div>
    );
  }
}
