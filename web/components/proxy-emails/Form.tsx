import { SelectField, TextField, Checkbox, Button, Paper } from 'react-md';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';

interface EmailFormProps {
  onSubmit(email: Ptorx.ProxyEmail): void;
  create?: boolean;
  email: Ptorx.ProxyEmail;
}

interface EmailFormState {
  advancedSettingsTab: number;
  addressAvailable: boolean;
  showAdvanced: boolean;
  email: Ptorx.ProxyEmail;
}

export class EmailForm extends React.Component<EmailFormProps, EmailFormState> {
  static defaultProps = {
    email: {
      name: '',
      toEmail: '',
      saveMail: false,
      directForward: false,
      noToAddress: false,
      filters: [],
      modifiers: [],
      domain: 1
    },
    create: false
  };

  timeout: NodeJS.Timeout;
  state: EmailFormState = {
    advancedSettingsTab: 0,
    addressAvailable: true,
    showAdvanced: false,
    email: this.props.email
  };

  constructor(props) {
    super(props);
  }

  onChange(prop: keyof Ptorx.ProxyEmail, value: any) {
    const { email } = this.state;
    this.setState({ email: { ...email, [prop]: value } });
    if (prop == 'address' || prop == 'domainId') this.onCheckAddress();
  }

  onCheckAddress() {
    const { address, domainId: domain } = this.state.email;
    if (!address) return this.setState({ addressAvailable: true });
    api
      .get('/proxy-emails/availability', { params: { domain, address } })
      .then(res => this.setState({ addressAvailable: res.data.available }));
  }

  onSubmit() {
    this.props.onSubmit(this.state.email);
  }

  render() {
    const { addressAvailable, showAdvanced, email } = this.state;
    const { create } = this.props;

    return (
      <div className="email-form">
        <Paper
          zDepth={1}
          component="section"
          className="main-form section flex"
        >
          <TextField
            id="text--name"
            type="text"
            label="Name"
            value={email.name}
            onChange={v => this.onChange('name', v)}
            helpText={'(optional) Give your email a name to find it easier'}
            maxLength={40}
          />

          {create ? (
            <React.Fragment>
              <TextField
                id="text--address"
                type="text"
                label="Address"
                error={!addressAvailable}
                value={email.address}
                onChange={v => this.onChange('address', v)}
                helpText={
                  '(optional) Customize your Ptorx address or leave it blank ' +
                  'for a randomly generated address'
                }
                errorText="Address is not available"
                maxLength={64}
              />

              <SelectField
                id="select--domain"
                label="Domain"
                value={email.domainId}
                onChange={v => this.onChange('domainId', v)}
                helpText={'The domain your proxy email will use'}
                position={SelectField.Positions.BELOW}
                className="md-full-width"
                menuItems={this.props.data.domains.map(d =>
                  Object({ label: `@${d.domain}`, value: d.id })
                )}
              />
            </React.Fragment>
          ) : null}

          <SelectField
            id="select--redirect"
            label="Redirect To"
            value={email.toEmail}
            onChange={v => this.onChange('toEmail', v)}
            position={SelectField.Positions.BELOW}
            helpText={
              'Your real email that messages sent to your Ptorx address ' +
              'will be redirected to'
            }
            className="md-full-width"
            menuItems={this.props.data.account.emails.map(e => e.address)}
          />

          {!showAdvanced && (
            <Button
              flat
              primary
              onClick={() => this.setState({ showAdvanced: true })}
              iconChildren="settings"
            >
              Advanced Settings
            </Button>
          )}
        </Paper>

        <Paper
          style={{ display: showAdvanced ? 'flex' : 'none' }}
          zDepth={1}
          component="section"
          className="advanced-settings checkboxes section"
        >
          <Checkbox
            id="checkbox--save-mail"
            name="save-mail"
            label="Save Mail"
            defaultChecked={email.saveMail}
          />

          <Checkbox
            id="checkbox--direct-forward"
            name="direct-forward"
            label="Direct Forward"
            defaultChecked={email.directForward}
          />
        </Paper>

        <Button primary raised onClick={() => this.onSubmit()}>
          {create ? 'Create' : 'Update'}
        </Button>
      </div>
    );
  }
}
