import { RouteComponentProps } from 'react-router-dom';
import { ModifierForm } from 'components/modifiers/Form';
import * as React from 'react';
import * as swal from 'sweetalert';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';

interface EditModifierState {
  modifier?: Ptorx.Modifier;
}

export class EditModifier extends React.Component<
  RouteComponentProps,
  EditModifierState
> {
  state: EditModifierState = { modifier: null };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    api
      .get(`/modifiers/${this.props.match.params.modifier}`)
      .then(res => this.setState({ modifier: res.data }))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onSubmit(modifier: Ptorx.Modifier) {
    api
      .put(`/modifiers/${this.props.match.params.modifier}`, modifier)
      .then(res => {
        this.props.history.push('/app/modifiers/list');
        swal('Success', `Modifier '${modifier.name}' updated`, 'success');
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    if (!this.state.modifier) return null;
    return (
      <ModifierForm
        modifier={this.state.modifier}
        onSubmit={d => this.onSubmit(d)}
      />
    );
  }
}
