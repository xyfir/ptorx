import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Action creators
import { editFilter } from 'actions/creators/filters';

// Components
import Form from 'components/filters/Form';

export default class EditFilter extends React.Component {
  constructor(props) {
    super(props);

    this._updateEmails = this._updateEmails.bind(this);

    this.state = {
      id: location.hash.split('/')[3],
      loading: true
    };

    request.get('/api/filters/' + this.state.id).end((err, res) => {
      if (err || res.body.error) {
        swal('Error', 'Could not load data', 'error');
      } else {
        delete res.body.error;

        this.props.dispatch(
          editFilter(
            Object.assign(
              {},
              this.props.data.filters.find(f => f.id == this.state.id),
              res.body
            )
          )
        );

        this.setState({ loading: false });
      }
    });
  }

  onUpdate(data) {
    request
      .put('/api/filters/' + this.state.id)
      .send(data)
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        } else {
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

          location.hash = '#/filters/list';
          swal('Success', `Filter '${data.name}' updated`, 'success');

          // Filter was linked to emails that we must now trigger updates on
          if (res.body.update !== undefined) {
            this._updateEmails(
              this.state.id,
              this.props.data.emails,
              res.body.update
            );
          }
        }
      });
  }

  _updateEmails(id, emails, update, index = 0) {
    if (update[index] === undefined) return;

    // Get email object
    let email = emails.find(e => e.id == update[index]);

    // All emails need to be loaded
    if (email === undefined) {
      request
        .get('/api/emails')
        .end((err, res) =>
          this._updateEmails(id, res.body.emails, update, index)
        );
    }
    // Full email data needs to be loaded
    else if (email.toEmail === undefined) {
      request.get('/api/emails/' + email.id).end((err, res) => {
        email = Object.assign(email, res.body);

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

      request
        .put('/api/emails/' + email.id)
        .send({
          modifiers,
          filters,
          to: email.toEmail,
          name: email.name,
          saveMail: email.saveMail,
          description: email.description,
          noToAddress: email.address == '',
          noSpamFilter: !email.spamFilter
        })
        .end(() => this._updateEmails(id, emails, update, index + 1));
    }
  }

  render() {
    if (this.state.loading) return <div />;

    const filter = this.props.data.filters.find(f => f.id == this.state.id);

    return <Form filter={filter} onSubmit={d => this.onUpdate(d)} />;
  }
}
