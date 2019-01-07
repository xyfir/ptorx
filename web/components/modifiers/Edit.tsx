import { api } from 'lib/api';
import * as React from 'react';
import * as swal from 'sweetalert';

// Components
import Form from 'components/modifiers/Form';

// Action creators
import { editModifier } from 'actions/modifiers';

export default class UpdateModifier extends React.Component {
  constructor(props) {
    super(props);

    this.state = { id: location.hash.split('/')[3], loading: true };

    api
      .get(`/modifiers/${this.state.id}`)
      .then(res => {
        delete res.data.error;
        res.data.data =
          res.data.data.substr(0, 1) == '{'
            ? JSON.parse(res.data.data)
            : res.data.data;

        this.props.dispatch(
          editModifier(
            Object.assign(
              {},
              this.props.data.modifiers.find(mod => mod.id == this.state.id),
              res.data
            )
          )
        );

        this.setState({
          loading: false,
          type: this.props.data.modifiers.find(mod => mod.id == this.state.id)
            .type
        });
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  /**
   * @param {object} modifier
   * @param {object} data
   */
  onUpdate(modifier, data) {
    api
      .put(`/modifiers/${this.state.id}`, Object.assign({}, modifier, data))
      .then(res => {
        modifier.id = this.state.id;
        modifier.data = data;

        this.props.dispatch(
          editModifier(
            Object.assign(
              {},
              this.props.data.modifiers.find(m => m.id == this.state.id),
              modifier
            )
          )
        );

        location.hash = '#/modifiers/list';
        swal('Success', `Modifier '${modifier.name}' updated`, 'success');
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    if (this.state.loading) return null;

    const mod = this.props.data.modifiers.find(mod => mod.id == this.state.id);

    return <Form modifier={mod} onSubmit={(m, d) => this.onUpdate(m, d)} />;
  }
}
