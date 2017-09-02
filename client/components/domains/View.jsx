import request from 'superagent';
import React from 'react';
import copy from 'copyr';

// Action creators
import { removeDomain } from 'actions/creators/domains';

// react-md
import TableColumn from 'react-md/lib/DataTables/TableColumn';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import DataTable from 'react-md/lib/DataTables/DataTable';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TextField from 'react-md/lib/TextFields';
import TableRow from 'react-md/lib/DataTables/TableRow';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';

export default class ViewDomain extends React.Component {

  constructor(props) {
    super(props);

    this.state = { id: +location.hash.split('/')[1], loading: true };

    this._loadDomain = this._loadDomain.bind(this);
  }

  componentWillMount() {
    this._loadDomain();
  }

  /**
   * Let domain user remove domain from their account.
   */
  onRemoveFromAccount() {
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this domain will be deleted.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!'
    }, () =>
      request
        .delete(
          `../api/domains/${this.state.id}/users/${this.props.account.uid}`
        )
        .end((err, res) => err || res.body.error
          ? swal('Error', res.body.message, 'error')
          : location.hash = '#domains' && location.reload()
        )
    );
  }

  /**
   * Let creator remove domain from Ptorx.
   */
  onRemoveFromPtorx() {
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails linked to this domain will be deleted.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!'
    }, () =>
      request
        .delete(`../api/domains/${this.state.id}`)
        .end((err, res) => err || res.body.error
          ? swal('Error', res.body.message, 'error')
          : location.hash = '#domains' && location.reload()
        )
    );
  }

  /**
   * Let creator remove a user from their domain.
   * @param {number} id
   */
  onRemoveUser(id) {
    swal({
      title: 'Are you sure?',
      text: 'Any proxy emails the user has with this domain will be deleted.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete them!'
    }, () =>
      request
        .delete(`../api/domains/${this.state.id}/users/${id}`)
        .end((err, res) => err || res.body.error
          ? swal('Error', res.body.message, 'error')
          : this._loadDomain()
        )
    );
  }

  /**
   * Authorize a user to use domain via request key.
   */
  onAddUser() {
    request
      .post(`../api/domains/${this.state.id}/users`)
      .send({
        key: this.refs.requestKey.getField().value,
        label: this.refs.label.getField().value
      })
      .end((err, res) => err || res.body.error
        ? swal('Error', res.body.message, 'error')
        : this._loadDomain()
      );
  }

  /**
   * Check if the domain's DNS records have been set correctly.
   */
  onVerify() {
    request
      .put(`../api/domains/${this.state.id}/verify`)
      .end((err, res) => err || res.body.error
        ? swal('Error', res.body.message, 'error')
        : this.setState({ verified: true })
      );
  }

  _loadDomain() {
    request
      .get('../api/domains/' + this.state.id)
      .end((err, res) => {
        if (err || res.body.error) return location.hash = '#domains';

        res.body.loading = false;
        this.setState(res.body);
      });
  }

  render() {
    if (this.state.loading)
      return null;
    else if (this.state.isCreator) return (
      <div className='view-domains-as-creator'>
        <Paper
          zDepth={1}
          component='section'
          className='info section flex'
        >
          <h3>{this.state.domain}</h3>

          {this.state.verified ? (
            <p className='verified'>This domain has been verified.</p>
          ) : (
            <div className='unverified flex'>
              <p>
                This domain is unverified. Check Ptorx's Help Docs for help verifying your domain. <a onClick={() => copy(this.state.domainKey)}>Copy verification key to clipboard</a>.
              </p>

              <Button
                raised secondary
                label='Verify'
                onClick={() => this.onVerify()}
              >verified_user</Button>
            </div>
          )}

          <Button
            primary raised
            label='Remove'
            onClick={() => this.onRemoveFromPtorx()}
          >delete</Button>
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='add-user section flex'
        >
          <h3>Add User</h3>

          <TextField
            id='text--request-key'
            ref='requestKey'
            type='text'
            label='Request Key'
            className='md-cell'
          />

          <TextField
            id='text--label'
            ref='label'
            type='text'
            label='Label'
            helpText='A name for the user you are adding'
            className='md-cell'
          />
  
          <Button
            primary raised
            label='Add'
            onClick={() => this.onAddUser()}
          >add</Button>
        </Paper>

        <Paper
          zDepth={1}
          component='section'
          className='users section flex'
        >
          <h3>Users</h3>

          <DataTable plain>
            <TableHeader>
              <TableRow>
                <TableColumn>Label</TableColumn>
              </TableRow>
            </TableHeader>

            <TableBody>{
              this.state.users.map(user => 
                <TableRow key={user.id}>
                  <TableColumn>{user.label || user.requestKey}</TableColumn>
                  <TableColumn>
                    <Button
                      icon
                      onClick={() => this.onRemoveUser(user.id)}
                    >delete</Button>
                  </TableColumn>
                </TableRow>
              )
            }</TableBody>
          </DataTable>
        </Paper>
      </div>
    );
    else return (
      <Paper
        zDepth={1}
        component='section'
        className='view-domain-as-user section flex'
      >
        <h3>{this.state.domain}</h3>

        {this.state.global ? (
          <span className='global' >
            This is a global domain to which all Ptorx users have access. No changes can be made to it.
          </span>
        ) : (
          <Button
            primary raised
            label='Remove'
            onClick={() => this.onRemoveFromAccount()}
          >delete</Button>
        )}
      </Paper>
    );
  }

}