import { CATEGORIES } from 'constants/categories';
import { Matches } from 'components/panel/utils/Matches';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';

export const PrimaryEmailMatches = () => (
  <Matches
    description={(primaryEmail: Ptorx.PrimaryEmailList[0]) =>
      `${primaryEmail.verified ? 'V' : 'Unv'}erified email added ${moment
        .unix(primaryEmail.created)
        .fromNow()}`
    }
    category={CATEGORIES.find(c => c.name == 'Primary Emails')}
    name={(primaryEmail: Ptorx.PrimaryEmailList[0]) => primaryEmail.address}
  />
);
