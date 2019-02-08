import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { TextField, Button } from '@material-ui/core';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { api } from 'lib/api';

interface AddFilterState {
  name: string;
}

class _AddFilter extends React.Component<
  RouteComponentProps & InjectedNotistackProps,
  AddFilterState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: AddFilterState = { name: '' };

  onSubmit() {
    api
      .post('/filters', { name: this.state.name })
      .then(res => {
        this.props.history.push(`/app/filters/${res.data.id}`);
        return api.get('/filters');
      })
      .then(res => this.context.dispatch({ filters: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { name } = this.state;
    return (
      <div>
        <TextField
          fullWidth
          id="name"
          type="text"
          value={name}
          margin="normal"
          onChange={e => this.setState({ name: e.target.value })}
          helperText="Name your filter to find it easier"
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

export const AddFilter = withSnackbar(_AddFilter);
