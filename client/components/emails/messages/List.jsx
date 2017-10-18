import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// react-md
import SelectField from 'react-md/lib/SelectFields';
import ListItem from 'react-md/lib/Lists/ListItem';
import Dialog from 'react-md/lib/Dialogs';
import List from 'react-md/lib/Lists/List';

// Action creators
import { loadMessages, deleteMessage } from 'actions/creators/messages';

// Constants
import { messageTypes } from 'constants/types';

export default class MessageList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      emailId: +location.hash.split('/')[2], loading: true, type: 0
    };

    this._loadMessages = this._loadMessages.bind(this);

    this._loadMessages(this.state.type);
  }

  componentWillUpdate(props, state) {
    if (this.state.type != state.type) this._loadMessages(state.type);
  }

  onDelete() {
    const id = this.state.selected;

    swal({
      button: 'Yes',
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning'
    })
    .then(() =>
      request.delete(`/api/emails/${this.state.emailId}/messages/${id}`)
    )
    .then(res => {
      if (res.body.error) throw 'Could not delete message';

      this.setState({ selected: '' })
      this.props.dispatch(deleteMessage(id));
    })
    .catch(err => swal('Error', err.toString(), 'error'));
  }

  /**
   * Load messages of `type`.
   * @param {number} type
   */
  _loadMessages(type) {
    request
      .get(`/api/emails/${this.state.emailId}/messages`)
      .query({ type })
      .end((err, res) => {
        this.props.dispatch(loadMessages(res.body.messages));
        this.setState({ loading: false });
      });
  }

  render() {
    if (this.state.loading) return null;

    const { selected, emailId } = this.state;
    const { messages } = this.props.data;
    
    return (
      <div className='messages flex'>
        <nav className='navbar-sub'>
          <a href={`#emails/messages/${emailId}/send`}>Send</a>
          <a href={`#emails/edit/${emailId}`}>Edit Email</a>
        </nav>

        <SelectField
          id='select--type'
          label='Filter'
          value={this.state.type}
          className='md-cell'
          menuItems={
            Object.keys(messageTypes).map(t =>
              Object({ label: messageTypes[t], value: +t })
            )
          }
          onChange={v => this.setState({ type: v })}
        />
        
        {messages.length ? (
          <List className='messages md-paper md-paper--1 section'>{
            messages.map(msg =>
              <ListItem
                key={msg.id}
                onClick={() => this.setState({ selected: msg.id })}
                primaryText={msg.subject}
                secondaryText={
                  (new Date(msg.received * 1000)).toLocaleString()
                }
              />
            )
          }</List>
        ) : (
          <h3>This inbox is empty.</h3>
        )}

        <Dialog
          id='selected-message'
          title={
            selected && messages.find(m => m.id == selected).subject
          }
          onHide={() => this.setState({ selected: '' })}
          visible={!!selected}
        >
          <List>
            <ListItem
              primaryText='View'
              onClick={() => location.hash =
                `#emails/messages/${emailId}/view/${selected}`
              }
            />
            <ListItem
              primaryText='Reply'
              onClick={() => location.hash =
                `#emails/messages/${emailId}/view/${selected}?reply=1`
              }
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