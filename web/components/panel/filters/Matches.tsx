import { CATEGORIES } from 'lib/categories';
import { Matches } from 'components/panel/utils/Matches';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';

export const FilterMatches = () => (
  <Matches
    description={(filter: Ptorx.FilterList[0]) =>
      `Created ${moment.unix(filter.created).fromNow()}`
    }
    category={CATEGORIES.find(c => c.name == 'Filters')}
    name={(filter: Ptorx.FilterList[0]) => `${filter.type} — ${filter.name}`}
  />
);
