import { InputAdornment, TextField } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import { PrimaryEmailMatches } from 'components/panel/primary-emails/Matches';
import { ModifierMatches } from 'components/panel/modifiers/Matches';
import { MessageMatches } from 'components/panel/messages/Matches';
import { DomainMatches } from 'components/panel/domains/Matches';
import { FilterMatches } from 'components/panel/filters/Matches';
import { AliasMatches } from 'components/panel/aliases/Matches';
import { PanelContext } from 'lib/PanelContext';
import * as React from 'react';

export const SearchInput = () => (
  <PanelContext.Consumer>
    {({ search, dispatch, categories }) => (
      <TextField
        id="search"
        type="search"
        value={search}
        margin="normal"
        variant="outlined"
        onChange={e => dispatch({ search: e.target.value.toLowerCase() })}
        fullWidth
        autoFocus
        placeholder={`Search for ${categories.join(', ').toLowerCase()}...`}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />
    )}
  </PanelContext.Consumer>
);

export const SearchMatches = () => (
  <PanelContext.Consumer>
    {({
      primaryEmails,
      categories,
      modifiers,
      messages,
      domains,
      aliases,
      filters
    }) => (
      <div>
        {categories.indexOf('Aliases') > -1 && aliases.length ? (
          <AliasMatches />
        ) : null}
        {categories.indexOf('Messages') > -1 && messages.length ? (
          <MessageMatches />
        ) : null}
        {categories.indexOf('Primary Emails') > -1 && primaryEmails.length ? (
          <PrimaryEmailMatches />
        ) : null}
        {categories.indexOf('Filters') > -1 && filters.length ? (
          <FilterMatches />
        ) : null}
        {categories.indexOf('Modifiers') > -1 && modifiers.length ? (
          <ModifierMatches />
        ) : null}
        {categories.indexOf('Domains') > -1 && domains.length ? (
          <DomainMatches />
        ) : null}
      </div>
    )}
  </PanelContext.Consumer>
);
