import { RouteComponentProps } from 'react-router-dom';
import { loadEmails } from 'actions/emails';
import { EmailForm } from 'components/emails/Form';
import * as moment from 'moment';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';
import * as qs from 'qs';

export class CreateEmail extends React.Component<RouteComponentProps> {
  constructor(props) {
    super(props);

    this.state = { loading: true };
  }

  async componentDidMount() {
    const { App } = this.props;
    const q = qs.parse(location.search);

    const copy = +q.duplicate || +App.state.account.email_template;
    let email = App.state.emails.find(e => e.id == copy);

    // Load data to prefill data
    if (email) {
      const domain = email.address.split('@')[1];
      email.domain = App.state.domains.find(d => d.domain == domain).id;

      try {
        const res = await api.get(`/emails/${copy}`);
        email = Object.assign({}, email, res.data);
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
    api
      .post('/emails', data)
      .then(() => {
        // Clear emails so they're loaded again
        this.props.App.dispatch(loadEmails([]));
        this.props.history.push(
          `/app/emails/list?q=${encodeURIComponent(data.name)}`
        );
        swal('Success', `Email '${data.name}' created`, 'success');
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    if (this.state.loading) return null;

    return (
      <div className="email-create">
        <EmailForm
          {...this.props}
          email={this.state.email}
          create={true}
          onSubmit={d => this.onSubmit(d)}
        />
      </div>
    );
  }
}
