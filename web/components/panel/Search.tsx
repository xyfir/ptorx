import { TextField, ListItemText, ListItem, List } from '@material-ui/core';
import { DomainMatches } from 'components/panel/domains/Matches';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import * as Fuse from 'fuse.js';
import { Link } from 'react-router-dom';

export class Search extends React.Component {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;

  search<
    T extends {
      fullAddress?: string;
      subject?: string;
      address?: string;
      domain?: string;
      name?: string;
      from?: string;
    }
  >(items: T[]): T[] {
    const { search } = this.context;
    if (search) {
      const fuse = new Fuse(items, {
        shouldSort: true,
        threshold: 0.4,
        keys: ['from', 'name', 'domain', 'address', 'subject', 'fullAddress']
      });
      items = fuse.search(search);
    }
    return items;
  }

  renderPrimaryEmails(primaryEmails: Ptorx.PrimaryEmailList) {
    if ([].indexOf('Primary Emails') == -1 || !primaryEmails.length)
      return null;
    return (
      <List>
        {this.search(primaryEmails).map(primaryEmail => (
          <Link
            key={primaryEmail.id}
            to={`/app/primary-emails/${primaryEmail.id}`}
          >
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
    if ([].indexOf('Proxy Emails') == -1 || !proxyEmails.length) return null;
    return (
      <List>
        {this.search(proxyEmails).map(proxyEmail => (
          <Link key={proxyEmail.id} to={`/app/proxy-emails/${proxyEmail.id}`}>
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
    if ([].indexOf('Modifiers') == -1 || !modifiers.length) return null;
    return (
      <List>
        {this.search(modifiers).map(modifier => (
          <Link key={modifier.id} to={`/app/modifiers/${modifier.id}`}>
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
    if ([].indexOf('Messages') == -1 || !messages.length) return null;
    return (
      <List>
        {this.search(messages).map(message => (
          <Link key={message.id} to={`/app/messages/${message.id}`}>
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
    if ([].indexOf('Filters') == -1 || !filters.length) return null;
    return (
      <List>
        {this.search(filters).map(filter => (
          <Link key={filter.id} to={`/app/filters/${filter.id}`}>
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

  render() {
    const {
      primaryEmails,
      proxyEmails,
      categories,
      modifiers,
      messages,
      dispatch,
      domains,
      filters,
      search
    } = this.context;
    return (
      <div>
        <TextField
          fullWidth
          id="search"
          type="search"
          value={search}
          margin="normal"
          onChange={e => dispatch({ search: e.target.value.toLowerCase() })}
          placeholder="Search..."
        />
        {this.renderPrimaryEmails(primaryEmails)}
        {this.renderProxyEmails(proxyEmails)}
        {this.renderModifiers(modifiers)}
        {this.renderMessages(messages)}
        {this.renderFilters(filters)}
        {categories.indexOf('Domains') > -1 && domains.length ? (
          <DomainMatches domains={this.search(domains)} />
        ) : null}
      </div>
    );
  }
}
