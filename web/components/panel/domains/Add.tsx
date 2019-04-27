import { withSnackbar, WithSnackbarProps } from 'notistack';
import { Typography, TextField, Button } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';

interface AddDomainState {
  requestKey: Ptorx.DomainUser['requestKey'];
  domain: Ptorx.Domain['domain'];
}

class _AddDomain extends React.Component<
  RouteComponentProps & WithSnackbarProps,
  AddDomainState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: AddDomainState = { requestKey: '', domain: '' };

  onSubmit() {
    api
      .post('/domains', { domain: this.state.domain })
      .then(res => {
        this.props.history.push(`/app/domains/${res.data.id}`);
        return api.get('/domains');
      })
      .then(res => this.context.dispatch({ domains: res.data }))
      .catch(err => {
        const { error } = err.response.data;
        if (error == 'That domain already exists in our database')
          return api.post('/domains/users', { domain: this.state.domain });
        else this.props.enqueueSnackbar(error);
      })
      .then(res => res && this.setState({ requestKey: res.data.requestKey }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { requestKey, domain } = this.state;
    return requestKey ? (
      <div>
        <Typography variant="body2">
          Send the following request key to the domain's owner so that they can
          authorize you to use their domain.
        </Typography>
        <TextField
          fullWidth
          id="requestKey"
          type="text"
          value={requestKey}
          margin="normal"
        />
      </div>
    ) : (
      <div>
        <TextField
          fullWidth
          id="domain"
          type="text"
          value={domain}
          margin="normal"
          onChange={e => this.setState({ domain: e.target.value })}
          helperText="You must be able to configure this domain's DNS records"
          placeholder="example.com"
        />
        <Button
          color="primary"
          variant="contained"
          onClick={() => this.onSubmit()}
        >
          Add
        </Button>
      </div>
    );
  }
}

export const AddDomain = withSnackbar(_AddDomain);
