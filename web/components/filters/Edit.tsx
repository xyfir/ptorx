import { RouteComponentProps } from 'react-router-dom';
import { FilterForm } from 'components/filters/Form';
import * as React from 'react';
import * as swal from 'sweetalert';
import { Ptorx } from 'typings/ptorx';
import { api } from 'lib/api';

interface EditFilterState {
  filter?: Ptorx.Filter;
}

export class EditFilter extends React.Component<
  RouteComponentProps,
  EditFilterState
> {
  state: EditFilterState = { filter: null };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    api
      .get(`/filters/${this.props.match.params.filter}`)
      .then(res => this.setState({ filter: res.data }))
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  onSubmit(filter: Ptorx.Filter) {
    api
      .put(`/filters/${this.props.match.params.filter}`, filter)
      .then(res => {
        this.props.history.push('/app/filters/list');
        swal('Success', `Filter '${filter.name}' updated`, 'success');
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    if (!this.state.filter) return null;
    return (
      <FilterForm filter={this.state.filter} onSubmit={d => this.onSubmit(d)} />
    );
  }
}
