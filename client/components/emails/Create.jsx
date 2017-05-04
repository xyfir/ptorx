import request from 'superagent';
import React from 'react';

// Components
import Form from 'components/emails/Form';

// Action creators
import { addEmail } from 'actions/creators/emails';

// Modules
import parseQuery from 'lib/parse-hash-query';

export default class CreateEmail extends React.Component {

  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);

    this.state = { loading: true };
  }

  componentWillMount() {
    const q = parseQuery();

    // Load data from email with id q.copy
    if (q.copy) {
      const email = this.props.data.emails.find(e => e.id == q.copy);

      if (!email) return;

      request
        .get('../api/emails/' + q.copy)
        .end((err, res) => {
          if (!err && !res.body.error) {
            this.setState({
              showAdvanced: true, loading: false,
              email: Object.assign(email, res.body)
            });
          }
        });
    }
    else {
      this.setState({ loading: false });
    }
  }

  onSubmit(data) {
    request
      .post('../api/emails')
      .send(data)
      .end((err, res) => {
        if (res.body.error) {
          swal('Error', res.body.message, 'error');
        }
        else {
          // Add to state.emails
          data.id = res.body.id;
          this.props.dispatch(addEmail(data));

          location.hash = 'emails/list';
          swal('Success', `Email '${data.name}' created`, 'success');
        }
      });
  }

  render() {
    if (this.state.loading) return <div />;
    
    return (
      <div className='email-create'>
        <Form
          {...this.props}
          email={this.state.email}
          create={true}
          onSubmit={this.onSubmit}
          recaptcha={this.props.data.account.trial}
        />
      </div>
    );
  }

}