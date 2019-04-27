import { withSnackbar, WithSnackbarProps } from 'notistack';
import { Typography, TextField, Button } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { ChipSelector } from 'components/panel/utils/ChipSelector';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';

interface AddAliasState {
  domainId: Ptorx.Alias['domainId'];
  address: Ptorx.Alias['address'];
  name: Ptorx.Alias['name'];
}

class _AddAlias extends React.Component<
  RouteComponentProps & WithSnackbarProps,
  AddAliasState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: AddAliasState = {
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
      .post('/aliases', { domainId, address, name })
      .then(res => {
        this.props.history.push(`/app/aliases/${res.data.id}`);
        return api.get('/aliases');
      })
      .then(res => this.context.dispatch({ aliases: res.data }))
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

export const AddAlias = withSnackbar(_AddAlias);
