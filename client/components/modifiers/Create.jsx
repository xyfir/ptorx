import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Components
import Form from 'components/modifiers/Form';

// Action creators
import { addModifier } from 'actions/creators/modifiers';

export default class CreateModifier extends React.Component {

  constructor(props) {
    super(props);
  }

  /**
   * @param {object} modifier
   * @param {object} data
   */
  onCreate(modifier, data) {
    request
      .post('/api/modifiers')
      .send(Object.assign({}, modifier, data))
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        }
        else {
          // Add to state.modifiers
          modifier.id = res.body.id;
          modifier.data = data;
          this.props.dispatch(addModifier(modifier));

          if (this.props.onCreate) {
            this.props.onCreate(res.body.id);
          }
          else {
            location.hash = '#/modifiers/list';
            swal('Success', `Modifier '${modifier.name}' created`, 'success');
          }
        }
      });
  }

  

  render() {
    return <Form onSubmit={(m, d) => this.onCreate(m, d)} />
  }

}