import { displayAddress } from 'lib/display-address';
import { CATEGORIES } from 'constants/categories';
import { Matches } from 'components/panel/utils/Matches';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';

export const MessageMatches = () => (
  <Matches
    defaultPerPage={25}
    description={(message: Ptorx.MessageList[0]) =>
      `Received ${moment.unix(message.created).fromNow()}`
    }
    category={CATEGORIES.find(c => c.name == 'Messages')}
    name={(message: Ptorx.MessageList[0]) =>
      `${displayAddress(message.from)} — ${message.subject}`
    }
  />
);
