import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Action creators
import { loadModifiers, deleteModifier } from 'actions/creators/modifiers';

// Constants
import { modifierTypes } from 'constants/types';

// Modules
import findMatches from 'lib/find-matching';

// Components
import Pagination from 'components/misc/Pagination';
import Search from 'components/misc/Search';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import List from 'react-md/lib/Lists/List';

export default class ModifierList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: 0, page: 1, search: { query: '', type: 0 }
    };

    if (props.data.modifiers.length == 0) {
      request
        .get('/api/modifiers')
        .end((err, res) =>
          this.props.dispatch(loadModifiers(res.body.modifiers))
        );
    }
  }

  /**
   * Delete the selected m.
   */
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

    request.delete('/api/modifiers/' + id)
      .then(res => {
        if (res.body.error) throw 'Could not delete modifier';

        this.props.dispatch(deleteModifier(id));
      })
      .catch(err => swal('Error', err.toString(), 'error'));
  }

  /**
   * Open the 'EditModifier' view.
   */
  onEdit() {
    location.hash = '#/modifiers/edit/' + this.state.selected;
  }

  render() {
    return (
      <div className='modifiers'>
        <Button
          floating fixed primary
          tooltipPosition='left'
          tooltipLabel='Create new modifier'
          iconChildren='add'
          onClick={() => location.hash = '#/modifiers/create'}
        />

        <Search
          onSearch={v => this.setState({ search: v })}
          type='modifier'
        />

        <List className='modifiers-list section md-paper md-paper--1'>{
          findMatches(this.props.data.modifiers, this.state.search)
            .filter(mod => !mod.global)
            .splice((this.state.page - 1) * 25, 25)
            .map(m =>
              <ListItem
                threeLines
                key={m.id}
                onClick={() => this.setState({ selected: m.id })}
                className='modifier'
                primaryText={m.name}
                secondaryText={modifierTypes[m.type] + '\n' + m.description}
              />
            )
        }</List>

        <Pagination
          itemsPerPage={25}
          onGoTo={p => this.setState({ page: p })}
          items={this.props.data.modifiers.length}
          page={this.state.page}
        />

        <Dialog
          id='selected-modifier'
          title={
            !this.state.selected ? '' : this.props.data.modifiers.find(
              e => e.id == this.state.selected
            ).name
          }
          onHide={() => this.setState({ selected: 0 })}
          visible={!!this.state.selected}
        >
          <List>
            <ListItem
              primaryText='Edit'
              onClick={() => this.onEdit()}
            />
            <ListItem
              primaryText='Delete'
              onClick={() => this.onDelete()}
            />
          </List>
        </Dialog>
      </div>
    );
  }

}