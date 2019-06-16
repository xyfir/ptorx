import { ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { CATEGORIES } from 'lib/categories';
import { FileCopy } from '@material-ui/icons';
import { Matches } from 'components/panel/utils/Matches';
import * as moment from 'moment';
import * as React from 'react';
// @ts-ignore
import * as copy from 'clipboard-copy';
import { Ptorx } from 'types/ptorx';

export const AliasMatches = () => (
  <Matches
    secondaryAction={(alias: Ptorx.AliasList[0]) => (
      <ListItemSecondaryAction>
        <IconButton
          aria-label="Copy alias address to clipboard"
          onClick={e => (e.preventDefault(), copy(alias.fullAddress))}
          color="secondary"
        >
          <FileCopy />
        </IconButton>
      </ListItemSecondaryAction>
    )}
    defaultPerPage={10}
    description={(alias: Ptorx.AliasList[0]) =>
      `Created ${moment.unix(alias.created).fromNow()}`
    }
    category={CATEGORIES.find(c => c.name == 'Aliases')}
    name={(alias: Ptorx.AliasList[0]) => `${alias.fullAddress} — ${alias.name}`}
  />
);
