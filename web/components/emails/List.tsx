import { DialogContainer, ListItem, FontIcon, Button, List } from 'react-md';
import { api } from 'lib/api';
import * as React from 'react';
import copy from 'copyr';
import * as swal from 'sweetalert';

// Action creators
import { loadEmails, deleteEmail } from 'actions/emails';

// Modules
import findMatches from 'lib/find-matching';

// Components
import Pagination from 'components/misc/Pagination';
import Search from 'components/misc/Search';

export default class EmailList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: 0,
      page: 1,
      search: { query: '', type: 0 }
    };
  }

  componentDidMount() {
    if (this.props.data.emails.length) return;
    api
      .get('/emails')
      .then(res => this.props.dispatch(loadEmails(res.data.emails)));
  }

  /**
   * Load 'CreateEmail' view with email's values loaded in.
   */
  onDuplicate() {
    location.hash = '#/emails/create?duplicate=' + this.state.selected;
  }

  /**
   * Opens confirmation dialogue and allows user to delete a proxy email.
   */
  async onDelete() {
    const id = this.state.selected;
    this.setState({ selected: 0 });

    const confirm = await swal({
      buttons: true,
      title: 'Are you sure?',
      text:
        'You will no longer receive emails sent to this address. \
        You will not be able to recreate this address.',
      icon: 'warning'
    });

    if (!confirm) return;

    api
      .delete(`/emails/${id}`)
      .then(() => this.props.dispatch(deleteEmail(id)))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  /**
   * Open the 'EditEmail' view.
   */
  onEdit() {
    location.hash = '#/emails/edit/' + this.state.selected;
  }

  /**
   * Copies the proxy email's address to the clipboard.
   */
  onCopy() {
    const email = this.props.data.emails.find(e => e.id == this.state.selected)
      .address;

    copy(email);
    this.setState({ selected: 0 });
  }

  render() {
    return (
      <div className="emails">
        <Button
          floating
          fixed
          primary
          tooltipPosition="left"
          tooltipLabel="Create new proxy email"
          iconChildren="add"
          onClick={() => (location.hash = '#/emails/create')}
        />

        <Search onSearch={v => this.setState({ search: v })} type="email" />

        <List className="proxy-emails-list section md-paper md-paper--1">
          {findMatches(this.props.data.emails, this.state.search)
            .splice((this.state.page - 1) * 25, 25)
            .map(email => (
              <ListItem
                threeLines
                key={email.id}
                onClick={() => this.setState({ selected: email.id })}
                className="email"
                primaryText={email.name}
                secondaryText={email.address + '\n' + email.description}
              />
            ))}
        </List>

        <Pagination
          itemsPerPage={25}
          onGoTo={p => this.setState({ page: p })}
          items={this.props.data.emails.length}
          page={this.state.page}
        />

        <DialogContainer
          id="selected-email"
          title={
            !this.state.selected
              ? ''
              : this.props.data.emails.find(e => e.id == this.state.selected)
                  .address
          }
          onHide={() => this.setState({ selected: 0 })}
          visible={!!this.state.selected}
        >
          <List>
            <ListItem
              primaryText="Edit"
              leftIcon={<FontIcon>edit</FontIcon>}
              onClick={() => this.onEdit()}
            />
            <ListItem
              primaryText="Copy to clipboard"
              leftIcon={<FontIcon>content_copy</FontIcon>}
              onClick={() => this.onCopy()}
            />
            <ListItem
              primaryText="Create duplicate"
              leftIcon={<FontIcon>control_point_duplicate</FontIcon>}
              onClick={() => this.onDuplicate()}
            />
            <ListItem
              primaryText="Delete"
              leftIcon={<FontIcon>delete</FontIcon>}
              onClick={() => this.onDelete()}
            />
          </List>
        </DialogContainer>
      </div>
    );
  }
}
