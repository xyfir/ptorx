import request from 'superagent';
import React from 'react';
import swal from 'sweetalert';

// Components
import Form from 'components/modifiers/Form';

// Action creators
import { editModifier } from 'actions/creators/modifiers';

export default class UpdateModifier extends React.Component {

  constructor(props) {
    super(props);

    this.state = { id: location.hash.split('/')[3], loading: true };

    request
      .get('/api/modifiers/' + this.state.id)
      .end((err, res) => {
        if (err || res.body.err) {
          swal('Error', 'Could not load data', 'error');
        }
        else {
          delete res.body.error;
          res.body.data = res.body.data.substr(0, 1) == '{'
            ? JSON.parse(res.body.data) : res.body.data;
          
          this.props.dispatch(editModifier(
            Object.assign(
              {},
              this.props.data.modifiers.find(mod => mod.id == this.state.id),
              res.body
            )
          ));

          this.setState({
            loading: false, type: this.props.data.modifiers.find(mod =>
              mod.id == this.state.id
            ).type
          });
        }
      });
  }

  /**
   * @param {object} modifier
   * @param {object} data
   */
  onUpdate(modifier, data) {
    request
      .put('/api/modifiers/' + this.state.id)
      .send(Object.assign({}, modifier, data))
      .end((err, res) => {
        if (err || res.body.error) {
          swal('Error', res.body.message, 'error');
        }
        else {
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
        }
      });
  }

  render() {
    if (this.state.loading) return <div />;
    
    const mod = this.props.data.modifiers.find(mod => mod.id == this.state.id);

    return <Form modifier={mod} onSubmit={(m, d) => this.onUpdate(m, d)} />
  }

}