import { RouteComponentProps } from 'react-router-dom';
import { AppContext } from 'lib/AppContext';
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

interface ViewDomainState {}

export class ViewDomain extends React.Component<
  RouteComponentProps,
  ViewDomainState
> {
  static contextType = AppContext;
  context!: React.ContextType<typeof AppContext>;

  state: ViewDomainState = {
    id: +this.props.match.params.domain,
    loading: true
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.load();
  }

  onRemoveFromAccount() {
    const { account } = this.context;
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this domain will be deleted.',
      icon: 'warning'
    })
      .then(() => api.delete(`/domains/${this.state.id}/users/${account.uid}`))
      .then(() => this.props.history.push('/app/domains/list'))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onRemoveFromPtorx() {
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this domain will be deleted.',
      icon: 'warning'
    })
      .then(() => api.delete(`/domains/${this.state.id}`))
      .then(() => this.props.history.push('/app/domains/list'))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onRemoveUser(id: number) {
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails the user has with this domain will be deleted.',
      icon: 'warning'
    })
      .then(() => api.delete(`/domains/${this.state.id}/users/${id}`))
      .then(() => this.load())
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onAddUser() {
    api
      .post(`/domains/${this.state.id}/users`, {
        key: this.refs.requestKey.value,
        label: this.refs.label.value
      })
      .then(() => this.load())
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onVerify() {
    api
      .put(`/domains/${this.state.id}/verify`)
      .then(() => this.setState({ verified: true }))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  load() {
    api
      .get(`/domains/${this.state.id}`)
      .then(res => {
        res.data.loading = false;
        this.setState(res.data);
      })
      .catch(() => this.props.history.push('/app/domains/list'));
  }

  render() {
    if (this.state.loading) return null;

    return this.state.isCreator ? (
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

        <Paper zDepth={1} component="section" className="add-user section flex">
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
    ) : (
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
