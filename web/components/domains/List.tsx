import { ListItem, Button, List } from 'react-md';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';

interface DomainListState {
  domains: Ptorx.DomainList;
}

export class DomainList extends React.Component<{}, DomainListState> {
  state: DomainListState = { domains: [] };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const res = await api.get('/domains');
    this.setState({ domains: res.data });
  }

  render() {
    const { domains } = this.state;
    return (
      <div className="domains">
        <Link to="/app/domains/create">
          <Button
            floating
            fixed
            primary
            tooltipPosition="left"
            tooltipLabel="Add domain"
            iconChildren="add"
          />
        </Link>

        <List className="domains-list section md-paper md-paper--1">
          {domains.map(d => (
            <Link to={`/app/domains/view/${d.id}`} key={d.id}>
              <ListItem primaryText={d.domain} />
            </Link>
          ))}
        </List>
      </div>
    );
  }
}
