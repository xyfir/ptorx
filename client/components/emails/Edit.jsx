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
import { loadEmails } from 'actions/emails';

export default class EditEmail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: location.hash.split('/')[3],
      loading: true
    };
  }

  componentDidMount() {
    const { App } = this.props;
    const email = App.state.emails.find(e => e.id == this.state.id);

    if (!email) location.href = '#/emails/list';

    request.get('/api/emails/' + this.state.id).end((err, res) => {
      if (err || res.body.error)
        return swal('Error', 'Could not load data', 'error');

      this.setState(Object.assign({ loading: false }, res.body));
    });
  }

  /** @param {object} data */
  onSubmit(data) {
    const { App } = this.props;

    request
      .put('/api/emails/' + this.state.id)
      .send(data)
      .end((err, res) => {
        if (err || res.body.error)
          return swal('Error', res.body.message, 'error');

        App.dispatch(loadEmails([]));
        location.hash = '#/emails/list';
        swal('Success', `Email '${data.name}' updated`, 'success');
      });
  }

  render() {
    const email = this.state;
    if (email.loading) return null;

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

        <Form {...this.props} email={email} onSubmit={d => this.onSubmit(d)} />
      </div>
    );
  }
}
