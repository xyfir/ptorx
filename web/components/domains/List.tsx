import { ListItem, Button, List } from 'react-md';
import * as React from 'react';
import { Link } from 'react-router-dom';

export const DomainList = props => (
  <div className="domains">
    <Link to="/app/domains/add">
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
      {props.data.domains.map(d => (
        <Link to={`/app/domains/${d.id}`} key={d.id}>
          <ListItem primaryText={d.domain} />
        </Link>
      ))}
    </List>
  </div>
);
