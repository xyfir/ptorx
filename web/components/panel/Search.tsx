import { TextField, ListItemText, ListItem, List } from '@material-ui/core';
import { PanelState } from 'components/panel/Panel';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import * as Fuse from 'fuse.js';
import { Link } from 'react-router-dom';

interface SearchProps {
  categories: PanelState['categories'];
}

interface SearchState {
  search: string;
}

export class Search extends React.Component<SearchProps, SearchState> {
  state: SearchState = { search: '' };

  search<T>(items: T[]): T[] {
    const { search } = this.state;
    if (search) {
      const fuse = new Fuse(items, {
        shouldSort: true,
        threshold: 0.4,
        // @ts-ignore
        keys: ['name', 'domain', 'fullAddress']
      });
      items = fuse.search(search.toLowerCase());
    }
    return items;
  }

  renderPrimaryEmails(primaryEmails: Ptorx.PrimaryEmailList) {
    if (
      this.props.categories.indexOf('primary emails') == -1 ||
      !primaryEmails.length
    )
      return null;
    return (
      <List>
        {this.search(primaryEmails).map(primaryEmail => (
          <Link key={primaryEmail.id} to={`/primary-emails/${primaryEmail.id}`}>
            <ListItem>
              <ListItemText
                primary={primaryEmail.address}
                secondary={`Created ${moment
                  .unix(primaryEmail.created)
                  .fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }

  renderProxyEmails(proxyEmails: Ptorx.ProxyEmailList) {
    if (
      this.props.categories.indexOf('proxy emails') == -1 ||
      !proxyEmails.length
    )
      return null;
    return (
      <List>
        {this.search(proxyEmails).map(proxyEmail => (
          <Link key={proxyEmail.id} to={`/proxy-emails/${proxyEmail.id}`}>
            <ListItem>
              <ListItemText
                primary={proxyEmail.fullAddress}
                secondary={`Created ${moment
                  .unix(proxyEmail.created)
                  .fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }

  renderModifiers(modifiers: Ptorx.ModifierList) {
    if (this.props.categories.indexOf('modifiers') == -1 || !modifiers.length)
      return null;
    return (
      <List>
        {this.search(modifiers).map(modifier => (
          <Link key={modifier.id} to={`/modifiers/${modifier.id}`}>
            <ListItem>
              <ListItemText
                primary={modifier.name}
                secondary={`Created ${moment.unix(modifier.created).fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }

  renderMessages(messages: Ptorx.MessageList) {
    if (this.props.categories.indexOf('messages') == -1 || !messages.length)
      return null;
    return (
      <List>
        {this.search(messages).map(message => (
          <Link key={message.id} to={`/messages/${message.id}`}>
            <ListItem>
              <ListItemText
                primary={message.subject}
                secondary={`From ${message.from} ${moment
                  .unix(message.created)
                  .fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }

  renderFilters(filters: Ptorx.FilterList) {
    if (this.props.categories.indexOf('filters') == -1 || !filters.length)
      return null;
    return (
      <List>
        {this.search(filters).map(filter => (
          <Link key={filter.id} to={`/filters/${filter.id}`}>
            <ListItem>
              <ListItemText
                primary={filter.name}
                secondary={`Created ${moment.unix(filter.created).fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }

  renderDomains(domains: Ptorx.DomainList) {
    if (this.props.categories.indexOf('domains') == -1 || !domains.length)
      return null;
    return (
      <List>
        {this.search(domains).map(domain => (
          <Link key={domain.id} to={`/domains/${domain.id}`}>
            <ListItem>
              <ListItemText
                primary={domain.domain}
                secondary={`Created ${moment.unix(domain.created).fromNow()}`}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }

  render() {
    const { search } = this.state;
    return (
      <PanelContext.Consumer>
        {context => (
          <div>
            <TextField
              fullWidth
              id="search"
              type="search"
              value={search}
              margin="normal"
              onChange={e => this.setState({ search: e.target.value })}
              placeholder="Search..."
            />
            {this.renderPrimaryEmails(context.primaryEmails)}
            {this.renderProxyEmails(context.proxyEmails)}
            {this.renderModifiers(context.modifiers)}
            {this.renderMessages(context.messages)}
            {this.renderFilters(context.filters)}
            {this.renderDomains(context.domains)}
          </div>
        )}
      </PanelContext.Consumer>
    );
  }
}
