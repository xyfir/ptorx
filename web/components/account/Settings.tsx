import { SelectField, Paper } from 'react-md';
import { AppContext } from 'lib/AppContext';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';

interface AccountSettingsState {
  emailTemplate?: number;
  primaryEmails: Ptorx.PrimaryEmailList;
}

export class AccountSettings extends React.Component<{}, AccountSettingsState> {
  static contextType = AppContext;
  context!: React.ContextType<typeof AppContext>;

  state: AccountSettingsState = {
    primaryEmails: [],
    emailTemplate: this.context.account.email_template
  };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const res = await api.get('/primary-emails');
    this.setState({ primaryEmails: res.data });
  }

  onSetEmailTemplate(id: number) {
    api
      .put('/account/email/template', { id })
      .then(() => this.setState({ emailTemplate: id }))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    const { primaryEmails, emailTemplate } = this.state;
    return (
      <div className="account-settings">
        <Paper
          zDepth={1}
          component="section"
          className="default-view section flex"
        >
          <h3>Default Page</h3>
          <p>
            Choose the page that the Ptorx application will go to when it first
            launches.
          </p>
        </Paper>

        <Paper
          zDepth={1}
          component="section"
          className="email-template section flex"
        >
          <h3>Email Template</h3>
          <p>
            Choose the proxy email whose data will be used as a template
            whenever you create a new proxy email.
          </p>

          <SelectField
            id="select-email"
            label="Select Email"
            onChange={v => this.onSetEmailTemplate(v)}
            className="md-full-width"
            menuItems={[{ value: null, label: 'None' }].concat(
              primaryEmails.map(e => ({ value: e.id, label: e.address }))
            )}
            defaultValue={emailTemplate}
          />
        </Paper>
      </div>
    );
  }
}
