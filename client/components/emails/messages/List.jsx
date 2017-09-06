import request from 'superagent';
import React from 'react';

// react-md
import ListItem from 'react-md/lib/Lists/ListItem';
import Dialog from 'react-md/lib/Dialogs';
import List from 'react-md/lib/Lists/List';

// Action creators
import { loadMessages, deleteMessage } from 'actions/creators/messages';

// Modules
import parseQuery from 'lib/parse-hash-query';

export default class MessageList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      emailId: location.hash.split('/')[2], loading: true,
      rejected: !!parseQuery().rejected
    };

    request
      .get(`../api/emails/${this.state.emailId}/messages`)
      .query({ rejected: this.state.rejected ? 1 : undefined })
      .end((err, res) => {
        this.props.dispatch(loadMessages(res.body.messages));
        this.setState({ loading: false });
      });
  }

  onDelete() {
    const id = this.state.selected;

    swal({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!'
    }, () => request
      .delete(`../api/emails/${this.state.emailId}/messages/${id}`)
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', 'Could not delete message', 'error');
        }
        else {
          this.setState({ selected: '' })
          this.props.dispatch(deleteMessage(id));
        }
      })
    );
  }

  render() {
    if (this.state.loading) return <div />;

    const { selected, emailId } = this.state;
    const { messages } = this.props.data;
    
    return (
      <div className='messages'>
        <nav className='navbar-sub'>
          <a href={`#emails/messages/${emailId}/send`}>Send Message</a>
          <a href={`#emails/edit/${emailId}`}>Edit Email</a>
          <a onClick={() => {
            if (this.state.rejected)
              location.hash = location.hash.split('?')[0];
            else
              location.hash += '?rejected=1';
            location.reload();
          }}>
            {this.state.rejected ? '' : 'Rejected '}Messages
          </a>
        </nav>
        
        <List className='messages md-paper md-paper--1 section'>{
          messages.length ?
            messages.map(msg =>
              <ListItem
                key={msg.id}
                onClick={() => this.setState({ selected: msg.id })}
                primaryText={msg.subject}
                secondaryText={
                  (new Date(msg.received * 1000)).toLocaleString()
                }
              />
            ) :
            <h3>This inbox is empty.</h3>
        }</List>

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