import { RouteComponentProps } from 'react-router-dom';
import { FilterForm } from 'components/filters/Form';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

export class CreateFilter extends React.Component<RouteComponentProps> {
  constructor(props) {
    super(props);
  }

  onCreate(data) {
    api
      .post('/filters', data)
      .then(res => {
        // Add to state.filters
        data.id = res.data.id;
        // ** (addFilter(data));

        if (this.props.onCreate) return this.props.onCreate(data.id);

        this.props.history.push(
          `/app/filters/list?q=${encodeURIComponent(data.name)}`
        );
        swal('Success', `Filter '${data.name}' created`, 'success');
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    return <FilterForm onSubmit={d => this.onCreate(d)} />;
  }
}
