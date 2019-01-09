import { ListItem, Button, DialogContainer, List } from 'react-md';
import { loadModifiers, deleteModifier } from 'actions/modifiers';
import { RouteComponentProps, Link } from 'react-router-dom';
import { LocalPagination } from 'components/misc/Pagination';
import { modifierTypes } from 'constants/types';
import { findMatching } from 'lib/find-matching';
import { Search } from 'components/misc/Search';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

export class ModifierList extends React.Component<RouteComponentProps> {
  constructor(props) {
    super(props);

    this.state = {
      selected: 0,
      page: 1,
      search: { query: '', type: 0 }
    };

    if (props.data.modifiers.length == 0) {
      api
        .get('/modifiers')
        .then(res => this.props.dispatch(loadModifiers(res.data.modifiers)));
    }
  }

  async onDelete() {
    const id = this.state.selected;
    this.setState({ selected: 0 });

    const confirm = await swal({
      buttons: true,
      title: 'Are you sure?',
      text: 'This modifier will be removed from any emails it is linked to.',
      icon: 'warning'
    });

    if (!confirm) return;

    api
      .delete(`/modifiers/${id}`)
      .then(res => {
        if (res.data.error) throw 'Could not delete modifier';
        this.props.dispatch(deleteModifier(id));
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onEdit() {
    this.props.history.push(`/app/modifiers/edit/${this.state.selected}`);
  }

  render() {
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
          {findMatching(this.props.data.modifiers, this.state.search)
            .filter(mod => !mod.global)
            .splice((this.state.page - 1) * 25, 25)
            .map(m => (
              <ListItem
                threeLines
                key={m.id}
                onClick={() => this.setState({ selected: m.id })}
                className="modifier"
                primaryText={m.name}
                secondaryText={modifierTypes[m.type] + '\n' + m.description}
              />
            ))}
        </List>

        <LocalPagination
          itemsPerPage={25}
          onGoTo={p => this.setState({ page: p })}
          items={this.props.data.modifiers.length}
          page={this.state.page}
        />

        <DialogContainer
          id="selected-modifier"
          title={
            !this.state.selected
              ? ''
              : this.props.data.modifiers.find(e => e.id == this.state.selected)
                  .name
          }
          onHide={() => this.setState({ selected: 0 })}
          visible={!!this.state.selected}
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
