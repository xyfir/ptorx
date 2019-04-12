import { ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { CATEGORIES } from 'constants/categories';
import { FileCopy } from '@material-ui/icons';
import { Matches } from 'components/panel/utils/Matches';
import * as moment from 'moment';
// @ts-ignore
import * as copy from 'clipboard-copy';
import * as React from 'react';
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
    description={(alias: Ptorx.AliasList[0]) =>
      `Created ${moment.unix(alias.created).fromNow()}`
    }
    category={CATEGORIES.find(c => c.name == 'Aliases')}
    name={(alias: Ptorx.AliasList[0]) => alias.fullAddress}
  />
);
