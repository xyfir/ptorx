import {
  TextField,
  ListItem,
  Button,
  Paper,
  List,
  DialogContainer
} from 'react-md';
import request from 'superagent';
import moment from 'moment';
import React from 'react';
import copy from 'copyr';
import swal from 'sweetalert';

// Action creators
import { deleteEmail, addEmail } from 'actions/account';

export default class PrimaryEmails extends React.Component {
  constructor(props) {
    super(props);

    this.state = { selectedEmail: {} };
  }

  onAddEmail() {
    const email = this._email.value;

    request.post('/api/account/email/' + email).end((err, res) => {
      if (err || res.body.error) {
        swal('Error', res.body.message, 'error');
      } else {
        this.props.dispatch(addEmail(res.body.id, email));
        this._email.getField().value = '';
      }
    });
  }

  async onDeleteEmail() {
    const { id } = this.state.selectedEmail;

    const confirm = await swal({
      button: 'Yes',
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this address will be deleted.',
      icon: 'warning'
    });

    if (!confirm) return;

    request
      .delete('/api/account/email/' + id)
      .then(res => {
        if (res.body.error) throw res.body.message;

        this.setState({ selectedEmail: {} });
        this.props.dispatch(deleteEmail(id));
      })
      .catch(err => swal('Error', err.toString(), 'error'));
  }

  render() {
    const { account } = this.props.App.state;

    return (
      <Paper
        zDepth={1}
        component="section"
        className="primary-emails section flex"
      >
        <h3>Primary Emails</h3>
        <p>
          These are your real email addresses that will receive messages
          redirected from your proxy email addresses.
        </p>

        <div className="add">
          <TextField
            id="email--email"
            ref={i => (this._email = i)}
            type="email"
            label="Email"
          />
          <Button icon iconChildren="add" onClick={() => this.onAddEmail()} />
        </div>

        <List>
          {account.emails.map(email => (
            <ListItem
              key={email.id}
              onClick={() => this.setState({ selectedEmail: email })}
              primaryText={email.address}
            />
          ))}
        </List>

        <DialogContainer
          id="selected-email"
          title={this.state.selectedEmail.address}
          onHide={() => this.setState({ selectedEmail: {} })}
          visible={!!this.state.selectedEmail.id}
        >
          <List>
            <ListItem
              primaryText="Copy"
              onClick={() => copy(this.state.selectedEmail.address)}
            />
            <ListItem
              primaryText="Delete"
              onClick={() => this.onDeleteEmail()}
            />
          </List>
        </DialogContainer>
      </Paper>
    );
  }
}
