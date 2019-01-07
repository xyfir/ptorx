import { modifierTypes, filterTypes } from 'constants/types';
import { ListItem, Button, List } from 'react-md';
import { findMatching } from 'lib/find-matching';
import { Search } from 'components/misc/Search';
import * as React from 'react';

const ShowMoreButton = props =>
  props.total <= props.limit ? null : (
    <Button flat primary onClick={() => (location.hash = props.link)}>
      Show {props.total - props.limit} More
    </Button>
  );

export class QuickSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = { search: { query: '' } };
  }

  /** @param {object[]} emails */
  _renderEmails(emails) {
    const q = this.state.search.query;

    return (
      <section>
        <header>
          <h1>Emails</h1>
          <ShowMoreButton
            link={`#/emails/list?q=${encodeURIComponent(q)}`}
            limit={7}
            total={emails.length}
          />
        </header>

        <List className="proxy-emails-list section md-paper md-paper--1">
          {emails.slice(0, 7).map(email => (
            <a href={`#/emails/edit/${email.id}`} key={email.id}>
              <ListItem
                threeLines
                className="email"
                primaryText={email.name}
                secondaryText={email.address + '\n' + email.description}
              />
            </a>
          ))}
        </List>
      </section>
    );
  }

  /** @param {object[]} filters */
  _renderFilters(filters) {
    const q = this.state.search.query;

    return (
      <section>
        <header>
          <h1>Filters</h1>
          <ShowMoreButton
            link={`#/filters/list?q=${encodeURIComponent(q)}`}
            limit={5}
            total={filters.length}
          />
        </header>

        <List className="filters-list section md-paper md-paper--1">
          {filters.slice(0, 5).map(filter => (
            <a href={`#/filters/edit/${filter.id}`} key={filter.id}>
              <ListItem
                threeLines
                className="filter"
                primaryText={filter.name}
                secondaryText={
                  filterTypes[filter.type] + '\n' + filter.description
                }
              />
            </a>
          ))}
        </List>
      </section>
    );
  }

  /** @param {object[]} domains */
  _renderDomains(domains) {
    const q = this.state.search.query;

    return (
      <section>
        <header>
          <h1>Domains</h1>
          <ShowMoreButton
            link={`#/domains/list?q=${encodeURIComponent(q)}`}
            limit={3}
            total={domains.length}
          />
        </header>

        <List className="domains-list section md-paper md-paper--1">
          {domains.slice(0, 3).map(domain => (
            <a href={'#/domains/' + domain.id} key={domain.id}>
              <ListItem primaryText={domain.domain} />
            </a>
          ))}
        </List>
      </section>
    );
  }

  /** @param {object[]} modifiers */
  _renderModifiers(modifiers) {
    const q = this.state.search.query;

    return (
      <section>
        <header>
          <h1>Modifiers</h1>
          <ShowMoreButton
            link={`#/modifiers/list?q=${encodeURIComponent(q)}`}
            limit={5}
            total={modifiers.length}
          />
        </header>

        <List className="modifiers-list section md-paper md-paper--1">
          {modifiers.slice(0, 5).map(modifier => (
            <a href={`#/modifiers/edit/${modifier.id}`} key={modifier.id}>
              <ListItem
                threeLines
                className="modifier"
                primaryText={modifier.name}
                secondaryText={
                  modifierTypes[modifier.type] + '\n' + modifier.description
                }
              />
            </a>
          ))}
        </List>
      </section>
    );
  }

  render() {
    const { emails, filters, domains, modifiers } = this.props.App.state;
    const { search } = this.state;
    const matches = {
      emails: findMatching(emails, search),
      filters: findMatching(filters, search),
      domains: findMatching(domains, search),
      modifiers: findMatching(modifiers.filter(m => !m.global), search)
    };

    return (
      <div className="quick-search">
        <Search onSearch={v => this.setState({ search: v })} type="email" />

        {matches.emails.length ? this._renderEmails(matches.emails) : null}
        {matches.filters.length ? this._renderFilters(matches.filters) : null}
        {matches.modifiers.length
          ? this._renderModifiers(matches.modifiers)
          : null}
        {matches.domains.length ? this._renderDomains(matches.domains) : null}
      </div>
    );
  }
}
