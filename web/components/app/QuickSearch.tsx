import { modifierTypes, filterTypes } from 'constants/types';
import { ListItem, Button, List } from 'react-md';
import { findMatching } from 'lib/find-matching';
import { Search } from 'components/common/Search';
import * as React from 'react';
import { Ptorx } from 'typings/ptorx';
import { Link } from 'react-router-dom';
import { api } from 'lib/api';

const ShowMoreButton = ({
  total,
  limit,
  link
}: {
  total: number;
  limit: number;
  link: string;
}) =>
  total <= limit ? null : (
    <Link to={link}>
      <Button flat primary>
        Show {total - limit} More
      </Button>
    </Link>
  );

interface QuickSearchState {
  search: { query: string };
  filters: Ptorx.FilterList;
  domains: Ptorx.DomainList;
  modifiers: Ptorx.ModifierList;
  proxyEmails: Ptorx.ProxyEmailList;
}

export class QuickSearch extends React.Component<{}, QuickSearchState> {
  state: QuickSearchState = {
    search: { query: '' },
    filters: [],
    domains: [],
    modifiers: [],
    proxyEmails: []
  };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const res = await Promise.all([
      api.get('/proxy-emails'),
      api.get('/modifiers'),
      api.get('/domains'),
      api.get('/filters')
    ]);
    this.setState({
      proxyEmails: res[0].data,
      modifiers: res[1].data,
      domains: res[2].data,
      filters: res[3].data
    });
  }

  renderProxyEmails(emails: Ptorx.ProxyEmailList) {
    const { query } = this.state.search;
    return (
      <section>
        <header>
          <h1>Emails</h1>
          <ShowMoreButton
            link={`/app/proxy-emails/list?q=${encodeURIComponent(query)}`}
            limit={7}
            total={emails.length}
          />
        </header>

        <List className="proxy-emails-list section md-paper md-paper--1">
          {emails.slice(0, 7).map(e => (
            <Link to={`/app/proxy-emails/edit/${e.id}`} key={e.id}>
              <ListItem
                threeLines
                className="email"
                primaryText={e.name}
                secondaryText={e.address + '\n' + e.description}
              />
            </Link>
          ))}
        </List>
      </section>
    );
  }

  renderFilters(filters: Ptorx.FilterList) {
    const { query } = this.state.search;
    return (
      <section>
        <header>
          <h1>Filters</h1>
          <ShowMoreButton
            link={`/app/filters/list?q=${encodeURIComponent(query)}`}
            limit={5}
            total={filters.length}
          />
        </header>

        <List className="filters-list section md-paper md-paper--1">
          {filters.slice(0, 5).map(f => (
            <Link to={`/app/filters/edit/${f.id}`} key={f.id}>
              <ListItem
                threeLines
                className="filter"
                primaryText={f.name}
                secondaryText={filterTypes[f.type] + '\n' + f.description}
              />
            </Link>
          ))}
        </List>
      </section>
    );
  }

  renderDomains(domains: Ptorx.DomainList) {
    const { query } = this.state.search;
    return (
      <section>
        <header>
          <h1>Domains</h1>
          <ShowMoreButton
            link={`/app/domains/list?q=${encodeURIComponent(query)}`}
            limit={3}
            total={domains.length}
          />
        </header>

        <List className="domains-list section md-paper md-paper--1">
          {domains.slice(0, 3).map(d => (
            <Link to={`/app/domains/${d.id}`} key={d.id}>
              <ListItem primaryText={d.domain} />
            </Link>
          ))}
        </List>
      </section>
    );
  }

  renderModifiers(modifiers: Ptorx.ModifierList) {
    const { query } = this.state.search;
    return (
      <section>
        <header>
          <h1>Modifiers</h1>
          <ShowMoreButton
            link={`/app/modifiers/list?q=${encodeURIComponent(query)}`}
            limit={5}
            total={modifiers.length}
          />
        </header>

        <List className="modifiers-list section md-paper md-paper--1">
          {modifiers.slice(0, 5).map(m => (
            <Link to={`/app/modifiers/edit/${m.id}`} key={m.id}>
              <ListItem
                threeLines
                className="modifier"
                primaryText={m.name}
                secondaryText={modifierTypes[m.type] + '\n' + m.description}
              />
            </Link>
          ))}
        </List>
      </section>
    );
  }

  render() {
    const { proxyEmails, modifiers, filters, domains, search } = this.state;
    const matches = {
      emails: findMatching(proxyEmails, search),
      filters: findMatching(filters, search),
      domains: findMatching(domains, search),
      modifiers: findMatching(modifiers.filter(m => !m.global), search)
    };

    return (
      <div className="quick-search">
        <Search onSearch={v => this.setState({ search: v })} type="email" />

        {matches.emails.length && this.renderProxyEmails(matches.emails)}
        {matches.filters.length && this.renderFilters(matches.filters)}
        {matches.modifiers.length && this.renderModifiers(matches.modifiers)}
        {matches.domains.length && this.renderDomains(matches.domains)}
      </div>
    );
  }
}
