// Reducers
import modifiers from 'reducers/modifiers';
import messages from 'reducers/messages';
import filters from 'reducers/filters';
import account from 'reducers/account';
import domains from 'reducers/domains';
import emails from 'reducers/emails';

import { INITIALIZE_STATE, CHANGE_VIEW } from 'actions/types/index';

export default function(state, action) {

  if (action.type == INITIALIZE_STATE)
    return action.state;
  else if (state == undefined)
    return {};

  return {
    modifiers: modifiers(state.modifiers, action),
    messages: messages(state.messages, action),
    filters: filters(state.filters, action),
    account: account(state.account, action),
    domains: domains(state.domains, action),
    emails: emails(state.emails, action),
    view: action.type == CHANGE_VIEW ? action.view : state.view
  };

}