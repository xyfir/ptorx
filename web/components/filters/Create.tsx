import { api } from 'lib/api';
import * as React from 'react';
import * as swal from 'sweetalert';

// Components
import Form from 'components/filters/Form';

// Action creators
import { addFilter } from 'actions/filters';

export default class CreateFilter extends React.Component {
  constructor(props) {
    super(props);
  }

  onCreate(data) {
    api
      .post('/filters', data)
      .then(res => {
        // Add to state.filters
        data.id = res.data.id;
        this.props.dispatch(addFilter(data));

        if (this.props.onCreate) return this.props.onCreate(data.id);

        location.hash = '#/filters/list?q=' + encodeURIComponent(data.name);
        swal('Success', `Filter '${data.name}' created`, 'success');
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    return <Form onSubmit={d => this.onCreate(d)} />;
  }
}
