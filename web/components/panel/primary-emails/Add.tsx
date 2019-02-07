import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { TextField, Button } from '@material-ui/core';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { api } from 'lib/api';

interface AddPrimaryEmailState {
  address: string;
}

class _AddPrimaryEmail extends React.Component<
  RouteComponentProps & InjectedNotistackProps,
  AddPrimaryEmailState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: AddPrimaryEmailState = { address: '' };

  onSubmit() {
    api
      .post('/primary-emails', { address: this.state.address })
      .then(res => {
        this.props.history.push(`/app/primary-emails/${res.data.id}`);
        return api.get('/primary-emails');
      })
      .then(res => this.context.dispatch({ primaryEmails: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { address } = this.state;
    return (
      <div>
        <TextField
          fullWidth
          id="address"
          type="email"
          value={address}
          margin="normal"
          onChange={e => this.setState({ address: e.target.value })}
          helperText="A primary email is your real email address that will receive incoming mail redirected from a proxy email"
          placeholder="email@example.com"
        />
        <Button
          color="primary"
          variant="contained"
          onClick={() => this.onSubmit()}
        >
          Create
        </Button>
      </div>
    );
  }
}

export const AddPrimaryEmail = withSnackbar(_AddPrimaryEmail);
