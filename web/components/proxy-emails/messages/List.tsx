import { SelectField, ListItem, DialogContainer, List } from 'react-md';
import { Link, RouteComponentProps } from 'react-router-dom';
import { EmailNavigation } from 'components/proxy-emails/Navigation';
import { messageTypes } from 'constants/types';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

interface MessageListState {
  messages: Ptorx.MessageList;
  message?: string;
  type: number;
}

export class MessageList extends React.Component<
  RouteComponentProps,
  MessageListState
> {
  state: MessageListState = {
    messages: [],
    type: 0
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps, prevState) {
    const { type } = this.state;
    if (type != prevState.type) this.load();
  }

  onDelete() {
    const { message, type } = this.state;
    const email = +this.props.match.params.email;

    swal({
      button: 'Yes',
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning'
    })
      .then(() => api.delete(`/proxy-emails/${email}/messages/${message}`))
      .then(() => {
        this.setState({ message: null });
        this.load();
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  load() {
    api
      .get(`/proxy-emails/${+this.props.match.params.email}/messages`, {
        params: { type: this.state.type }
      })
      .then(res => this.setState({ messages: res.data }))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    const { messages, message } = this.state;
    const emailId = +this.props.match.params.email;

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
            {messages.map(m => (
              <ListItem
                key={m.id}
                onClick={() => this.setState({ message: m.id })}
                primaryText={m.subject}
                secondaryText={new Date(m.received * 1000).toLocaleString()}
              />
            ))}
          </List>
        ) : (
          <h3>This inbox is empty.</h3>
        )}

        <DialogContainer
          id="selected-message"
          title={message && messages.find(m => m.id == message).subject}
          onHide={() => this.setState({ message: null })}
          visible={message !== null}
        >
          <List>
            <Link to={`/app/proxy-emails/messages/${emailId}/view/${message}`}>
              <ListItem primaryText="View" />
            </Link>
            <Link
              to={`/app/proxy-emails/messages/${emailId}/view/${message}?reply=1`}
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
