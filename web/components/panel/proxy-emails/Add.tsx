import { withSnackbar, withSnackbarProps } from 'notistack';
import { Typography, TextField, Button } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { ChipSelector } from 'components/panel/utils/ChipSelector';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';

interface AddProxyEmailState {
  domainId: Ptorx.ProxyEmail['domainId'];
  address: Ptorx.ProxyEmail['address'];
  name: Ptorx.ProxyEmail['name'];
}

class _AddProxyEmail extends React.Component<
  RouteComponentProps & withSnackbarProps,
  AddProxyEmailState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: AddProxyEmailState = {
    domainId: null,
    address: '',
    name: ''
  };

  componentDidMount() {
    const { domains } = this.context;
    if (domains && domains.length) this.setState({ domainId: domains[0].id });
  }

  onSubmit() {
    const { domainId, address, name } = this.state;
    api
      .post('/proxy-emails', { domainId, address, name })
      .then(res => {
        this.props.history.push(`/app/proxy-emails/${res.data.id}`);
        return api.get('/proxy-emails');
      })
      .then(res => this.context.dispatch({ proxyEmails: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { domainId, address, name } = this.state;
    const { domains } = this.context;
    if (!domains.length)
      return (
        <Typography variant="body2">
          Your account is not authorized to use any domains.
        </Typography>
      );
    return (
      <div>
        <TextField
          fullWidth
          id="name"
          type="text"
          value={name}
          margin="normal"
          onChange={e => this.setState({ name: e.target.value })}
          helperText="Display name used for redirected mail"
        />
        <TextField
          fullWidth
          id="address"
          type="text"
          value={address}
          margin="normal"
          onChange={e => this.setState({ address: e.target.value })}
          helperText={`This is the 'user' part of user@${
            domainId ? domains.find(d => d.id == domainId).domain : 'domain.tld'
          }. Leave blank for random`}
        />
        <ChipSelector
          onSelect={d => this.setState({ domainId: d })}
          selected={[domainId]}
          title="Domain"
          items={domains.map(d => ({ label: d.domain, value: d.id }))}
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

export const AddProxyEmail = withSnackbar(_AddProxyEmail);
