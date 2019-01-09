import { SelectField, ListItem, DialogContainer, List } from 'react-md';
import { loadMessages, deleteMessage } from 'actions/messages';
import { EmailNavigation } from 'components/emails/Navigation';
import { messageTypes } from 'constants/types';
import * as React from 'react';
import * as swal from 'sweetalert';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';

export class MessageList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      emailId: +this.props.match.params.email,
      loading: true,
      type: 0
    };

    this._loadMessages = this._loadMessages.bind(this);

    this._loadMessages(this.state.type);
  }

  componentDidUpdate(prevProps, prevState) {
    const { type } = this.state;
    if (type != prevState.type) this._loadMessages(type);
  }

  onDelete() {
    const id = this.state.selected;

    swal({
      button: 'Yes',
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning'
    })
      .then(() => api.delete(`/emails/${this.state.emailId}/messages/${id}`))
      .then(() => {
        this.setState({ selected: '' });
        this.props.dispatch(deleteMessage(id));
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  _loadMessages(type: number) {
    api
      .get(`/emails/${this.state.emailId}/messages`, { params: { type } })
      .then(res => {
        this.props.dispatch(loadMessages(res.data.errors));
        this.setState({ loading: false });
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    if (this.state.loading) return null;

    const { selected, emailId } = this.state;
    const { messages } = this.props.data;

    return (
      <div className="messages flex">
        <EmailNavigation email={emailId} />

        <SelectField
          id="select--type"
          label="Filter"
          value={this.state.type}
          className="md-cell"
          menuItems={Object.keys(messageTypes).map(t =>
            Object({ label: messageTypes[t], value: +t })
          )}
          onChange={v => this.setState({ type: v })}
        />

        {messages.length ? (
          <List className="messages md-paper md-paper--1 section">
            {messages.map(msg => (
              <ListItem
                key={msg.id}
                onClick={() => this.setState({ selected: msg.id })}
                primaryText={msg.subject}
                secondaryText={new Date(msg.received * 1000).toLocaleString()}
              />
            ))}
          </List>
        ) : (
          <h3>This inbox is empty.</h3>
        )}

        <DialogContainer
          id="selected-message"
          title={selected && messages.find(m => m.id == selected).subject}
          onHide={() => this.setState({ selected: '' })}
          visible={!!selected}
        >
          <List>
            <Link to={`/app/emails/messages/${emailId}/view/${selected}`}>
              <ListItem primaryText="View" />
            </Link>
            <Link
              to={`/app/emails/messages/${emailId}/view/${selected}?reply=1`}
            >
              <ListItem primaryText="Reply" />
            </Link>
            <ListItem primaryText="Delete" onClick={() => this.onDelete()} />
          </List>
        </DialogContainer>
      </div>
    );
  }
}
