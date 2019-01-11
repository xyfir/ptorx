import { ListItem, Button, DialogContainer, List } from 'react-md';
import { RouteComponentProps, Link } from 'react-router-dom';
import { LocalPagination } from 'components/common/Pagination';
import { modifierTypes } from 'constants/types';
import { findMatching } from 'lib/find-matching';
import { Search } from 'components/common/Search';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

interface ModifierListState {
  modifiers: Ptorx.ModifierList;
  modifier: number;
  search: { query: string; type: number };
  page: number;
}

export class ModifierList extends React.Component<
  RouteComponentProps,
  ModifierListState
> {
  state: ModifierListState = {
    modifier: 0,
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
    const { modifier } = this.state;

    const confirm = await swal({
      buttons: true,
      title: 'Are you sure?',
      text: 'This modifier will be removed from any emails it is linked to.',
      icon: 'warning'
    });
    if (!confirm) return;

    api
      .delete(`/modifiers/${modifier}`)
      .then(res => {
        this.setState({ modifier: 0 });
        this.load();
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onEdit() {
    this.props.history.push(`/app/modifiers/edit/${this.state.modifier}`);
  }

  async load() {
    const res = await api.get('/modifiers');
    this.setState({ modifiers: res.data });
  }

  render() {
    const { modifiers, modifier, search, page } = this.state;
    return (
      <div className="modifiers">
        <Link to="/app/modifiers/create">
          <Button
            floating
            fixed
            primary
            tooltipPosition="left"
            tooltipLabel="Create new modifier"
            iconChildren="add"
          />
        </Link>

        <Search onSearch={v => this.setState({ search: v })} type="modifier" />

        <List className="modifiers-list section md-paper md-paper--1">
          {findMatching(modifiers, search)
            .filter(m => !m.global)
            .splice((page - 1) * 25, 25)
            .map(m => (
              <ListItem
                threeLines
                key={m.id}
                onClick={() => this.setState({ modifier: m.id })}
                className="modifier"
                primaryText={m.name}
                secondaryText={modifierTypes[m.type] + '\n' + m.description}
              />
            ))}
        </List>

        <LocalPagination
          itemsPerPage={25}
          onGoTo={p => this.setState({ page: p })}
          items={modifiers.length}
          page={page}
        />

        <DialogContainer
          id="selected-modifier"
          title={modifier && modifiers.find(m => m.id == modifier).name}
          onHide={() => this.setState({ modifier: 0 })}
          visible={!!modifier}
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
