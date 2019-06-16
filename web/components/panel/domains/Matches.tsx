import { CATEGORIES } from 'lib/categories';
import { Matches } from 'components/panel/utils/Matches';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';

export const DomainMatches = () => (
  <Matches
    description={(domain: Ptorx.DomainList[0]) =>
      domain.isCreator
        ? `Added to Ptorx ${moment.unix(domain.created).fromNow()}`
        : `You are authorized to use this${
            domain.global ? ' global ' : ' '
          }domain`
    }
    category={CATEGORIES.find(c => c.name == 'Domains')}
    name={(domain: Ptorx.DomainList[0]) => domain.domain}
  />
);
