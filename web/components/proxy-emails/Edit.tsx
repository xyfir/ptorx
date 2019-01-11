import { RouteComponentProps } from 'react-router-dom';
import { EmailNavigation } from 'components/proxy-emails/Navigation';
import { EmailForm } from 'components/proxy-emails/Form';
import { Button } from 'react-md';
import * as React from 'react';
import * as swal from 'sweetalert';
import * as copy from 'copyr';
import { api } from 'lib/api';

export class EditEmail extends React.Component<RouteComponentProps> {
  constructor(props) {
    super(props);

    this.state = {
      id: +this.props.match.params.email,
      loading: true
    };
  }

  componentDidMount() {
    api
      .get(`/proxy-emails/${this.state.id}`)
      .then(res => {
        this.setState(Object.assign({ loading: false }, res.data));
      })
      .catch(() => swal('Error', 'Could not load data', 'error'));
  }

  onSubmit(data) {
    const { history } = this.props;
    api
      .put(`/proxy-emails/${this.state.id}`, data)
      .then(() => {
        // ** (loadEmails([]));
        history.push('/app/proxy-emails/list');
        swal('Success', `Email '${data.name}' updated`, 'success');
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    const email = this.state;
    if (email.loading) return null;

    return (
      <div className="edit-email">
        <EmailNavigation email={email.id} />

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

        <EmailForm
          {...this.props}
          email={email}
          onSubmit={d => this.onSubmit(d)}
        />
      </div>
    );
  }
}
