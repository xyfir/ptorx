import * as React from 'react';
import * as copy from 'copyr';
import * as swal from 'sweetalert';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';
import {
  DialogContainer,
  TextField,
  ListItem,
  Button,
  Paper,
  List
} from 'react-md';

interface PrimaryEmailsState {
  primaryEmails: Ptorx.PrimaryEmailList;
  primaryEmail?: Ptorx.ProxyEmailList[0];
  address: string;
}

export class PrimaryEmails extends React.Component<{}, PrimaryEmailsState> {
  state: PrimaryEmailsState = {
    primaryEmails: [],
    primaryEmail: null,
    address: 'user@example.com'
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.load();
  }

  async onAdd() {
    try {
      const res = await api.post('/primary-emails', {
        email: this.state.address
      });
      await this.load();
    } catch (err) {
      swal('Error', err.response.data.error, 'error');
    }
  }

  async onDelete() {
    const confirm = await swal({
      button: 'Yes',
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this address will be deleted.',
      icon: 'warning'
    });
    if (!confirm) return;

    try {
      const res = await api.delete(
        `/primary-emails/${this.state.primaryEmail.id}`
      );
      this.setState({ primaryEmail: null });
      this.load();
    } catch (err) {
      swal('Error', err.response.data.error, 'error');
    }
  }

  async load() {
    const res = await api.get('/primary-emails');
    this.setState({ primaryEmails: res.data });
  }

  render() {
    const { primaryEmails, primaryEmail, address } = this.state;

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
            id="email"
            type="email"
            label="Email"
            value={address}
            onChange={v => this.setState({ address: v })}
          />
          <Button icon iconChildren="add" onClick={() => this.onAdd()} />
        </div>

        <List>
          {primaryEmails.map(e => (
            <ListItem
              key={e.id}
              onClick={() => this.setState({ primaryEmail: e })}
              primaryText={e.address}
            />
          ))}
        </List>

        <DialogContainer
          id="selected-email"
          title={(primaryEmail || {}).address}
          onHide={() => this.setState({ primaryEmail: null })}
          visible={primaryEmail !== null}
        >
          <List>
            <ListItem
              primaryText="Copy"
              onClick={() => copy((primaryEmail || {}).address)}
            />
            <ListItem primaryText="Delete" onClick={() => this.onDelete()} />
          </List>
        </DialogContainer>
      </Paper>
    );
  }
}
