import request from 'superagent';
import moment from 'moment';
import React from 'react';
import swal from 'sweetalert';

// Components
import Form from 'components/emails/Form';

// Action creators
import { addEmail, loadEmails } from 'actions/creators/emails';

// Modules
import query from 'lib/parse-query-string';

export default class CreateEmail extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: true };
  }

  componentWillMount() {
    const { App } = this.props;
    const q = query(location.hash);

    // Load data to prefill form from email
    if (q.duplicate) {
      const email = App.state.emails.find(e => e.id == q.duplicate);

      if (!email) return;

      const domain = email.address.split('@')[1];
      email.domain = App.state.domains.find(d => d.domain == domain).id;

      request.get('/api/emails/' + q.duplicate).end((err, res) => {
        if (!err && !res.body.error) {
          this.setState({
            showAdvanced: true,
            loading: false,
            email: Object.assign({}, email, res.body)
          });
        }
      });
    }
    // Instantly create a new proxy email without showing form
    else if (q.instant) {
      this.onSubmit({
        to: App.state.account.emails[0].id,
        name: 'Untitled Instant Proxy Email',
        domain: 1,
        address: '',
        filters: '',
        saveMail: false,
        modifiers: '',
        description: 'Created on ' + moment().format('YYYY-MM-DD, HH:mm:ss'),
        noToAddress: false,
        noSpamFilter: false,
        directForward: false
      });
    }
    // Load form as normal
    else {
      this.setState({ loading: false });
    }
  }

  onSubmit(data) {
    request
      .post('/api/emails')
      .send(data)
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        } else {
          // Clear emails so they're loaded again
          this.props.App.dispatch(loadEmails([]));
          location.hash = '#/emails/list?q=' + encodeURIComponent(data.name);

          swal('Success', `Email '${data.name}' created`, 'success');
        }
      });
  }

  render() {
    if (this.state.loading) return null;

    return (
      <div className="email-create">
        <Form
          {...this.props}
          email={this.state.email}
          create={true}
          onSubmit={d => this.onSubmit(d)}
          recaptcha={this.props.App.state.account.trial}
        />
      </div>
    );
  }
}
