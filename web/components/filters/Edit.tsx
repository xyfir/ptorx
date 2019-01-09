import { RouteComponentProps } from 'react-router-dom';
import { FilterForm } from 'components/filters/Form';
import { editFilter } from 'actions/filters';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

export class EditFilter extends React.Component<RouteComponentProps> {
  constructor(props) {
    super(props);

    this._updateEmails = this._updateEmails.bind(this);

    this.state = {
      id: +this.props.match.params.filter,
      loading: true
    };

    api
      .get(`/filters/${this.state.id}`)
      .then(res => {
        delete res.data.error;
        this.props.dispatch(
          editFilter(
            Object.assign(
              {},
              this.props.data.filters.find(f => f.id == this.state.id),
              res.data
            )
          )
        );
        this.setState({ loading: false });
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onUpdate(data) {
    api
      .put(`/filters/${this.state.id}`, data)
      .then(res => {
        data.id = this.state.id;

        this.props.dispatch(
          editFilter(
            Object.assign(
              {},
              this.props.data.filters.find(f => f.id == this.state.id),
              data
            )
          )
        );

        this.props.history.push('/app/filters/list');
        swal('Success', `Filter '${data.name}' updated`, 'success');

        // Filter was linked to emails that we must now trigger updates on
        if (res.data.update !== undefined) {
          this._updateEmails(
            this.state.id,
            this.props.data.emails,
            res.data.update
          );
        }
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  _updateEmails(id, emails, update, index = 0) {
    if (update[index] === undefined) return;

    // Get email object
    let email = emails.find(e => e.id == update[index]);

    // All emails need to be loaded
    if (email === undefined) {
      api
        .get('/emails')
        .then(res => this._updateEmails(id, res.data.emails, update, index));
    }
    // Full email data needs to be loaded
    else if (email.toEmail === undefined) {
      api.get(`/emails/${email.id}`).then(res => {
        email = Object.assign(email, res.data);
        emails.forEach((e, i) => {
          if (e.id == email.id) emails[i] = email;
        });
        this._updateEmails(id, emails, update, index);
      });
    }
    // Update email
    else {
      const modifiers = email.modifiers.map(mod => mod.id).join(',');
      const filters = email.filters.map(f => f.id).join(',');

      api
        .put(`/emails/${email.id}`, {
          modifiers,
          filters,
          to: email.toEmail,
          name: email.name,
          saveMail: email.saveMail,
          description: email.description,
          noToAddress: email.address == '',
          noSpamFilter: !email.spamFilter
        })
        .then(() => this._updateEmails(id, emails, update, index + 1));
    }
  }

  render() {
    if (this.state.loading) return null;

    const filter = this.props.data.filters.find(f => f.id == this.state.id);

    return <FilterForm filter={filter} onSubmit={d => this.onUpdate(d)} />;
  }
}
