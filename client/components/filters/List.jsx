import request from 'superagent';
import React from 'react';

// Action creators
import { loadFilters, deleteFilter } from 'actions/creators/filters';
import { loadEmails } from 'actions/creators/emails';

// Constants
import { filterTypes } from 'constants/types';
import { URL } from 'constants/config';

// Modules
import findMatches from 'lib/find-matching';

// Components
import Search from 'components/misc/Search';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import List from 'react-md/lib/Lists/List'

export default class FilterList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: 0, search: { query: '', type: 0 }
    };

    if (props.data.filters.length == 0) {
      request
        .get('../api/filters')
        .end((err, res) =>
          this.props.dispatch(loadFilters(res.body.filters))
        );
    }

    this._removeFilter = this._removeFilter.bind(this);
  }

  /**
   * Deletes the selected filter and udpates the emails it is linked to.
   */
  onDelete() {
    const id = this.state.selected;
    this.setState({ selected: 0 });

    swal({
      title: 'Are you sure?',
      text: 'This filter will be removed from any emails it is linked to.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!'
    }, () =>
      request
        .delete('../api/filters/' + id)
        .end((err, res) => {
          if (err || res.body.error) {
            swal('Error', 'Could not delete filter', 'error');
          }
          else {
            this.props.dispatch(deleteFilter(id));

            // Filter was linked to emails that we must now trigger updates on
            if (res.body.update)
              this._removeFilter(id, this.props.data.emails, res.body.update);
          }
        })
    );
  }

  /**
   * Open the 'EditFilter' view.
   */
  onEdit() {
    location.hash = '#filters/edit/' + this.state.selected;
  }

  /**
   * Removes a deleted filter from any proxy emails that the filter is linked 
   * to.
   * @param {number} id - The id of the filter that was deleted.
   * @param {object[]} emails - Proxy email objects array.
   * @param {number[]} update - An array of proxy email ids that the filter is 
   * linked to and which need to be updated.
   * @param {number} index - The current index for the `update` array.
   */
  _removeFilter(id, emails, update, index = 0) {
    // Remove filter from email.filters for all linked filters
    if (update[index] === undefined) {
      update.forEach(e => {
        emails.forEach((email, i) => {
          if (e == email.id)
            emails[i].filters = email.filters.filter(f => f.id != id);
        });
      });
      
      this.props.dispatch(loadEmails(emails));
      return;
    }

    // Get email object
    const email = emails.find(e => e.id == update[index]);

    // All emails need to be loaded
    if (email === undefined) {
      request
        .get('../api/emails')
        .end((err, res) =>
          this._removeFilter(id, res.body.emails, update, index)
        );
    }
    // Full email data needs to be loaded
    else if (email.toEmail === undefined) {
      request
        .get('../api/emails/' + email.id)
        .end((err, res) => {
          Object.assign(email, res);

          emails.forEach((e, i) => {
            if (e.id == email.id)
              emails[i] = email;
          });

          this._removeFilter(id, emails, update, index);
        });
    }
    // Update email
    else {
      const filters = email.filters
        .filter(filter => filter.id != id)
        .map(filter => filter.id)
        .join(',');
      const modifiers = email.modifiers.map(mod => mod.id).join(',');
      
      request
        .put('../api/emails/' + email.id)
        .send({
          name: email.name, description: email.description, to: mail.toEmail,
          saveMail: +email.saveMail, noSpamFilter: +(!email.spamFilter),
          filters, modifiers, noToAddress: +(email.address == '')
        })
        .end((err, res) =>
          this._removeFilter(id, emails, update, index + 1)
        );
    }
  }

  render() {
    return (
      <div className='filters'>
        <Button
          floating fixed primary
          tooltipPosition='left'
          tooltipLabel='Create new filter'
          onClick={() => location.hash = '#filters/create'}
        >add</Button>
        
        <Search
          onSearch={v => this.setState({ search: v })}
          type='filter'
        />

        <List
          className='filters-list section md-paper md-paper--1'
        >{
          findMatches(
            this.props.data.filters, this.state.search
          ).filter(
            filter => !filter.global
          ).map(f =>
            <ListItem
              threeLines
              key={f.id}
              onClick={() => this.setState({ selected: f.id })}
              className='filter'
              primaryText={f.name}
              secondaryText={filterTypes[f.type] + '\n' + f.description}
            />
          )
        }</List>

        <Dialog
          id='selected-filter'
          title={
            !this.state.selected ? '' : this.props.data.filters.find(
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