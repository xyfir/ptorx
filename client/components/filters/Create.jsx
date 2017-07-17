import request from 'superagent';
import React from 'react';

// Components
import Form from 'components/filters/Form';

// Action creators
import { addFilter } from 'actions/creators/filters';

export default class CreateFilter extends React.Component {

  constructor(props) {
    super(props);
  }

  onCreate(data) {
    request
      .post('../api/filters')
      .send(data)
      .end((err, res) => {
        if (err || res.body.error)
          return swal('Error', res.body.message, 'error');

        // Add to state.filters
        data.id = res.body.id;
        this.props.dispatch(addFilter(data));

        if (this.props.onCreate)
          return this.props.onCreate(data.id);

        location.hash = '#filters/list';
        swal('Success', `Filter '${data.name}' created`, 'success');
      });
  }

  render() {
    return <Form onSubmit={d => this.onCreate(d)} />
  }

}