import { TextField, ListItemText, ListItem, List } from '@material-ui/core';
import { PrimaryEmailMatches } from 'components/panel/primary-emails/Matches';
import { ModifierMatches } from 'components/panel/modifiers/Matches';
import { DomainMatches } from 'components/panel/domains/Matches';
import { FilterMatches } from 'components/panel/filters/Matches';
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
      type?: string;
      name?: string;
      from?: string;
    }
  >(items: T[]): T[] {
    const { search } = this.context;
    if (search) {
      const fuse = new Fuse(items, {
        shouldSort: true,
        threshold: 0.4,
        keys: [
          'from',
          'name',
          'type',
          'domain',
          'address',
          'subject',
          'fullAddress'
        ]
      });
      items = fuse.search(search);
    }
    return items;
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
        {categories.indexOf('Primary Emails') > -1 && primaryEmails.length ? (
          <PrimaryEmailMatches primaryEmails={this.search(primaryEmails)} />
        ) : null}
        {this.renderProxyEmails(proxyEmails)}
        {categories.indexOf('Modifiers') > -1 && modifiers.length ? (
          <ModifierMatches modifiers={this.search(modifiers)} />
        ) : null}
        {this.renderMessages(messages)}
        {categories.indexOf('Filters') > -1 && filters.length ? (
          <FilterMatches filters={this.search(filters)} />
        ) : null}
        {categories.indexOf('Domains') > -1 && domains.length ? (
          <DomainMatches domains={this.search(domains)} />
        ) : null}
      </div>
    );
  }
}
