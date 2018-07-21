import request from 'superagent';
import moment from 'moment';
import React from 'react';
import swal from 'sweetalert';

// Components
import Form from 'components/emails/Form';

// Action creators
import { loadEmails } from 'actions/emails';

// Modules
import query from 'lib/parse-query-string';

export default class CreateEmail extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: true };
  }

  async componentDidMount() {
    const { App } = this.props;
    const q = query(location.hash);

    const copy = +q.duplicate || +App.state.account.email_template;
    let email = App.state.emails.find(e => e.id == copy);

    // Load data to prefill data
    if (email) {
      const domain = email.address.split('@')[1];
      email.domain = App.state.domains.find(d => d.domain == domain).id;

      try {
        const res = await request.get(`/api/emails/${copy}`);
        if (res.body.error) throw res.body;
        email = Object.assign({}, email, res.body);
      } catch (err) {
        email = null;
      }
    }

    // Instantly create a new proxy email without showing form
    if (q.instant) {
      email = Object.assign(
        {
          to: App.state.account.emails[0].id,
          name: 'Untitled Instant Proxy Email',
          domain: 1,
          filters: [],
          saveMail: false,
          modifiers: [],
          noToAddress: false,
          description: 'Created on ' + moment().format('YYYY-MM-DD, HH:mm:ss'),
          noSpamFilter: false,
          directForward: false
        },
        email || {}
      );
      email.address = '';
      email.filters = email.filters.map(f => f.id);
      email.modifiers = email.modifiers.map(m => m.id);
      this.onSubmit(email);
    }
    // Duplicate email (custom)
    else if (email) {
      this.setState({
        showAdvanced: true,
        loading: false,
        email
      });
    }
    // Load as normal
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
        />
      </div>
    );
  }
}
