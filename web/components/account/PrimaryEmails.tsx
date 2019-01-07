import { TextField, ListItem, Button, List, DialogContainer } from 'react-md';
import * as React from 'react';
import * as copy from 'copyr';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

// Action creators
import { deleteEmail, addEmail } from 'actions/account';

export default class PrimaryEmails extends React.Component {
  constructor(props) {
    super(props);

    this.state = { selectedEmail: {} };
  }

  async onAddEmail() {
    const email = this._email.value;

    let res: AxiosResponse;
    try {
      res = await api.post(`/account/email/${email}`);
      this.props.dispatch(addEmail(res.data.id, email));
      this._email.getField().value = '';
    } catch (err) {
      swal('Error', res.data.error, 'error');
    }
  }

  async onDeleteEmail() {
    const confirm = await swal({
      button: 'Yes',
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this address will be deleted.',
      icon: 'warning'
    });
    if (!confirm) return;

    const { id } = this.state.selectedEmail;
    let res: AxiosResponse;
    try {
      res = await api.delete(`/account/email/${id}`);
      this.setState({ selectedEmail: {} });
      this.props.dispatch(deleteEmail(id));
    } catch (err) {
      swal('Error', res.data.error, 'error');
    }
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
