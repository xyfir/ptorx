import { CATEGORIES } from 'lib/categories';
import { Matches } from 'components/panel/utils/Matches';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';

export const ModifierMatches = () => (
  <Matches
    description={(modifier: Ptorx.ModifierList[0]) =>
      `Created ${moment.unix(modifier.created).fromNow()}`
    }
    category={CATEGORIES.find(c => c.name == 'Modifiers')}
    name={(modifier: Ptorx.ModifierList[0]) => modifier.name}
  />
);
