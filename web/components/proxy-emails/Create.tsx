import { RouteComponentProps } from 'react-router-dom';
import { AppContext } from 'lib/AppContext';
import { EmailForm } from 'components/proxy-emails/Form';
import * as moment from 'moment';
import * as React from 'react';
import * as swal from 'sweetalert';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';
import * as qs from 'qs';

export class CreateEmail extends React.Component<RouteComponentProps> {
  static contextType = AppContext;
  context!: React.ContextType<typeof AppContext>;

  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  async componentDidMount() {
    const q = qs.parse(location.search);
    const copy = +q.duplicate || this.context.account.emailTemplate;
    const { data: proxyEmails }: { data: Ptorx.ProxyEmailList } = await api.get(
      '/proxy-emails'
    );

    // Load data to prefill data
    let email: Partial<Ptorx.ProxyEmail> = proxyEmails.find(e => e.id == copy);
    if (email) {
      const domain = email.address.split('@')[1];
      const { data: domains }: { data: Ptorx.DomainList } = await api.get(
        '/domains'
      );
      email.domain = domains.find(d => d.domain == domain).id;

      try {
        const res = await api.get(`/proxy-emails/${copy}`);
        Object.assign(email, res.data);
      } catch (err) {
        email = null;
      }
    }

    // Instantly create a new proxy email without showing form
    if (q.instant) {
      const {
        data: primaryEmails
      }: { data: Ptorx.PrimaryEmailList } = await api.get('/primary-emails');

      email = Object.assign(
        {
          to: (primaryEmails[0] || {}).id,
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
      .post('/proxy-emails', data)
      .then(() => {
        // Clear emails so they're loaded again
        // ** (loadEmails([]));
        this.props.history.push(
          `/app/proxy-emails/list?q=${encodeURIComponent(data.name)}`
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
