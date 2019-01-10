import { List, Button, DialogContainer, ListItem } from 'react-md';
import { RouteComponentProps, Link } from 'react-router-dom';
import { LocalPagination } from 'components/common/Pagination';
import { findMatching } from 'lib/find-matching';
import { filterTypes } from 'constants/types';
import { Search } from 'components/common/Search';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

export class FilterList extends React.Component<RouteComponentProps> {
  constructor(props) {
    super(props);

    this.state = {
      selected: 0,
      page: 1,
      search: { query: '', type: 0 }
    };

    if (props.data.filters.length == 0) {
      api.get('/filters');
      // ** .then(res => (loadFilters(res.data.filters)));
    }

    this._removeFilter = this._removeFilter.bind(this);
  }

  /**
   * Deletes the selected filter and udpates the emails it is linked to.
   */
  async onDelete() {
    const id = this.state.selected;
    this.setState({ selected: 0 });

    const confirm = await swal({
      buttons: true,
      title: 'Are you sure?',
      text: 'This filter will be removed from any emails it is linked to.',
      icon: 'warning'
    });
    if (!confirm) return;

    api
      .delete(`/filters/${id}`)
      .then(res => {
        // ** (deleteFilter(id));

        // Filter was linked to emails that we must now trigger updates on
        if (res.data.update)
          this._removeFilter(id, this.props.data.emails, res.data.update);
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onEdit() {
    this.props.history.push(`/app/filters/edit/${this.state.selected}`);
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

      // ** (loadEmails(emails));
      return;
    }

    // Get email object
    const email = emails.find(e => e.id == update[index]);

    // All emails need to be loaded
    if (email === undefined) {
      api
        .get('/proxy-emails')
        .then(res => this._removeFilter(id, res.data.emails, update, index));
    }
    // Full email data needs to be loaded
    else if (email.toEmail === undefined) {
      api.get(`/proxy-emails/${email.id}`).then(res => {
        Object.assign(email, res.data);

        emails.forEach((e, i) => {
          if (e.id == email.id) emails[i] = email;
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

      api
        .put(`/proxy-emails/${email.id}`, {
          name: email.name,
          description: email.description,
          to: email.toEmail,
          saveMail: +email.saveMail,
          noSpamFilter: +!email.spamFilter,
          filters,
          modifiers,
          noToAddress: +(email.address == '')
        })
        .then(() => this._removeFilter(id, emails, update, index + 1));
    }
  }

  render() {
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
          {findMatching(this.props.data.filters, this.state.search)
            .filter(filter => !filter.global)
            .splice((this.state.page - 1) * 25, 25)
            .map(f => (
              <ListItem
                threeLines
                key={f.id}
                onClick={() => this.setState({ selected: f.id })}
                className="filter"
                primaryText={f.name}
                secondaryText={filterTypes[f.type] + '\n' + f.description}
              />
            ))}
        </List>

        <LocalPagination
          itemsPerPage={25}
          onGoTo={p => this.setState({ page: p })}
          items={this.props.data.filters.length}
          page={this.state.page}
        />

        <DialogContainer
          id="selected-filter"
          title={
            !this.state.selected
              ? ''
              : this.props.data.filters.find(e => e.id == this.state.selected)
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
