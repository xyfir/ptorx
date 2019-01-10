import { RouteComponentProps } from 'react-router-dom';
import { ModifierForm } from 'components/modifiers/Form';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

export class CreateModifier extends React.Component<RouteComponentProps> {
  constructor(props) {
    super(props);
  }

  onCreate(modifier: any, data: any) {
    api
      .post('/modifiers', Object.assign({}, modifier, data))
      .then(res => {
        // Add to state.modifiers
        modifier.id = res.data.id;
        modifier.data = data;
        // ** (addModifier(modifier));

        if (this.props.onCreate) return this.props.onCreate(res.data.id);

        this.props.history.push(
          `/app/modifiers/list?q=${encodeURIComponent(modifier.name)}`
        );
        swal('Success', `Modifier '${modifier.name}' created`, 'success');
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    return <ModifierForm onSubmit={(m, d) => this.onCreate(m, d)} />;
  }
}
