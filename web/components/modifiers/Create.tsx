import { ModifierForm } from 'components/modifiers/Form';
import { addModifier } from 'actions/modifiers';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

export class CreateModifier extends React.Component {
  constructor(props) {
    super(props);
  }

  /**
   * @param {object} modifier
   * @param {object} data
   */
  onCreate(modifier, data) {
    api
      .post('/modifiers', Object.assign({}, modifier, data))
      .then(res => {
        // Add to state.modifiers
        modifier.id = res.data.id;
        modifier.data = data;
        this.props.dispatch(addModifier(modifier));

        if (this.props.onCreate) {
          this.props.onCreate(res.data.id);
        } else {
          location.hash =
            '#/modifiers/list?q=' + encodeURIComponent(modifier.name);
          swal('Success', `Modifier '${modifier.name}' created`, 'success');
        }
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    return <ModifierForm onSubmit={(m, d) => this.onCreate(m, d)} />;
  }
}
