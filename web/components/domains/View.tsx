import { removeDomain } from 'actions/domains';
import * as React from 'react';
import * as copy from 'copyr';
import * as swal from 'sweetalert';
import { api } from 'lib/api';
import {
  TableColumn,
  TableHeader,
  DataTable,
  TableBody,
  TextField,
  TableRow,
  Button,
  Paper
} from 'react-md';

export class ViewDomain extends React.Component {
  constructor(props) {
    super(props);

    this.state = { id: +location.hash.split('/')[2], loading: true };

    this._loadDomain = this._loadDomain.bind(this);
  }

  componentDidMount() {
    this._loadDomain();
  }

  /**
   * Let domain user remove domain from their account.
   */
  onRemoveFromAccount() {
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this domain will be deleted.',
      icon: 'warning'
    })
      .then(() =>
        api.delete(
          `/domains/${this.state.id}/users/${this.props.data.account.uid}`
        )
      )
      .then(() => {
        location.hash = '#/domains';
        location.reload();
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  /**
   * Let creator remove domain from Ptorx.
   */
  onRemoveFromPtorx() {
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this domain will be deleted.',
      icon: 'warning'
    })
      .then(() => api.delete(`/domains/${this.state.id}`))
      .then(() => {
        location.hash = '#/domains';
        location.reload();
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  /**
   * Let creator remove a user from their domain.
   */
  onRemoveUser(id: number) {
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails the user has with this domain will be deleted.',
      icon: 'warning'
    })
      .then(() => api.delete(`/domains/${this.state.id}/users/${id}`))
      .then(() => this._loadDomain())
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  /**
   * Authorize a user to use domain via request key.
   */
  onAddUser() {
    api
      .post(`/domains/${this.state.id}/users`, {
        key: this.refs.requestKey.value,
        label: this.refs.label.value
      })
      .then(() => this._loadDomain())
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  /**
   * Check if the domain's DNS records have been set correctly.
   */
  onVerify() {
    api
      .put(`/domains/${this.state.id}/verify`)
      .then(() => this.setState({ verified: true }))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  _loadDomain() {
    api
      .get(`/domains/${this.state.id}`)
      .then(res => {
        res.data.loading = false;
        this.setState(res.data);
      })
      .catch(err => (location.hash = '#/domains'));
  }

  render() {
    if (this.state.loading) return null;
    else if (this.state.isCreator)
      return (
        <div className="view-domains-as-creator">
          <Paper zDepth={1} component="section" className="info section flex">
            <h3>{this.state.domain}</h3>

            {this.state.verified ? (
              <p className="verified">This domain has been verified.</p>
            ) : (
              <div className="unverified flex">
                <p>
                  This domain is unverified. Check Ptorx's Help Docs for help
                  verifying your domain.
                </p>

                <label>TXT Hostname</label>
                <span>{this.state.domainKey.name}</span>

                <label>Value</label>
                <a onClick={() => copy(this.state.domainKey.value)}>
                  Copy to clipboard
                </a>

                <Button
                  raised
                  secondary
                  iconChildren="verified_user"
                  onClick={() => this.onVerify()}
                >
                  Verify
                </Button>
              </div>
            )}

            <Button
              primary
              raised
              iconChildren="delete"
              onClick={() => this.onRemoveFromPtorx()}
            >
              Remove
            </Button>
          </Paper>

          <Paper
            zDepth={1}
            component="section"
            className="add-user section flex"
          >
            <h3>Add User</h3>

            <TextField
              id="text--request-key"
              ref="requestKey"
              type="text"
              label="Request Key"
            />

            <TextField
              id="text--label"
              ref="label"
              type="text"
              label="Label"
              helpText="A name for the user you are adding"
            />

            <Button
              primary
              raised
              iconChildren="add"
              onClick={() => this.onAddUser()}
            >
              Add
            </Button>
          </Paper>

          <Paper zDepth={1} component="section" className="users section flex">
            <h3>Users</h3>

            <DataTable plain>
              <TableHeader>
                <TableRow>
                  <TableColumn>Label</TableColumn>
                </TableRow>
              </TableHeader>

              <TableBody>
                {this.state.users.map(user => (
                  <TableRow key={user.id}>
                    <TableColumn>{user.label || user.requestKey}</TableColumn>
                    <TableColumn>
                      <Button
                        icon
                        iconChildren="delete"
                        onClick={() => this.onRemoveUser(user.id)}
                      />
                    </TableColumn>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          </Paper>
        </div>
      );
    else
      return (
        <Paper
          zDepth={1}
          component="section"
          className="view-domain-as-user section flex"
        >
          <h3>{this.state.domain}</h3>

          {this.state.global ? (
            <span className="global">
              This is a global domain to which all Ptorx users have access. No
              changes can be made to it.
            </span>
          ) : (
            <Button
              primary
              raised
              iconChildren="delete"
              onClick={() => this.onRemoveFromAccount()}
            >
              Remove
            </Button>
          )}
        </Paper>
      );
  }
}
