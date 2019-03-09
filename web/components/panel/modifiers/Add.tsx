import { withSnackbar, withSnackbarProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { TextField, Button } from '@material-ui/core';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';

interface AddModifierState {
  name: Ptorx.Modifier['name'];
}

class _AddModifier extends React.Component<
  RouteComponentProps & withSnackbarProps,
  AddModifierState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: AddModifierState = { name: '' };

  onSubmit() {
    api
      .post('/modifiers', { name: this.state.name })
      .then(res => {
        this.props.history.push(`/app/modifiers/${res.data.id}`);
        return api.get('/modifiers');
      })
      .then(res => this.context.dispatch({ modifiers: res.data }))
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
          helperText="Name your modifier to find it easier"
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

export const AddModifier = withSnackbar(_AddModifier);
