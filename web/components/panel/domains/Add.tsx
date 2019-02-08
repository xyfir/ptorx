import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { TextField, Button } from '@material-ui/core';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';

interface AddDomainState {
  domain: Ptorx.Domain['domain'];
}

class _AddDomain extends React.Component<
  RouteComponentProps & InjectedNotistackProps,
  AddDomainState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: AddDomainState = { domain: '' };

  onSubmit() {
    api
      .post('/domains', { domain: this.state.domain })
      .then(res => {
        this.props.history.push(`/app/domains/${res.data.id}`);
        return api.get('/domains');
      })
      .then(res => this.context.dispatch({ domains: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { domain } = this.state;
    return (
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
