import { Button } from 'react-md';
import request from 'superagent';
import React from 'react';
import copy from 'copyr';
import swal from 'sweetalert';

// Components
import Navigation from 'components/emails/Navigation';

// Components
import Form from 'components/emails/Form';

// Action creators
import { editEmail } from 'actions/creators/emails';

export default class EditEmail extends React.Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      id: location.hash.split('/')[3],
      loading: true
    };
  }

  componentWillMount() {
    const email = this.props.data.emails.find(e => e.id == this.state.id);

    if (!email) location.href = '#/emails/list';

    request.get('/api/emails/' + this.state.id).end((err, res) => {
      if (res.body.err) {
        swal('Error', 'Could not load data', 'error');
        return;
      }

      delete res.body.error;
      this.props.dispatch(editEmail(Object.assign({}, email, res.body)));

      this.setState({ loading: false });
    });
  }

  onSubmit(data) {
    request
      .put('/api/emails/' + this.state.id)
      .send(data)
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
          return;
        }

        // data.to (id) -> data.toEmail (address)
        data.toEmail = this.props.data.account.emails.find(
          e => e.id == data.to
        ).address;
        delete data.to;

        // Set address
        if (data.noToAddress) {
          data.address = '';
        } else {
          data.address = this.props.data.emails.find(
            e => e.id == this.state.id
          ).address;
        }
        delete data.noToAddress;

        // data.modifiers|filters from id list string -> object array
        data.modifiers = data.modifiers
          .split(',')
          .map(m => this.props.data.modifiers.find(mod => m == mod.id));
        data.filters = data.filters
          .split(',')
          .map(f => this.props.data.filters.find(filter => f == filter.id));

        data.id = this.state.id;

        this.props.dispatch(editEmail(data));

        location.hash = '#/emails/list';
        swal('Success', `Email '${data.name}' updated`, 'success');
      });
  }

  render() {
    if (this.state.loading) return null;

    const email = this.props.data.emails.find(e => e.id == this.state.id);

    return (
      <div className="edit-email">
        <Navigation email={email.id} />

        <div className="address">
          <span>{email.address}</span>
          <Button
            icon
            primary
            tooltipPosition="right"
            tooltipLabel="Copy to clipboard"
            iconChildren="content_copy"
            onClick={() => copy(email.address)}
          />
        </div>

        <Form {...this.props} email={email} onSubmit={this.onSubmit} />
      </div>
    );
  }
}
