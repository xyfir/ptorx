import { ListItem, Button, List } from 'react-md';
import * as React from 'react';

export const DomainList = props => (
  <div className="domains">
    <Button
      floating
      fixed
      primary
      tooltipPosition="left"
      tooltipLabel="Add domain"
      iconChildren="add"
      onClick={() => (location.hash = '#/domains/add')}
    />

    <List className="domains-list section md-paper md-paper--1">
      {props.data.domains.map(d => (
        <a href={'#/domains/' + d.id} key={d.id}>
          <ListItem primaryText={d.domain} />
        </a>
      ))}
    </List>
  </div>
);
