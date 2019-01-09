import { INITIALIZE_STATE, HIDE_WELCOME } from 'constants/actions';
import { modifiersReducer } from 'reducers/modifiers';
import { messagesReducer } from 'reducers/messages';
import { filtersReducer } from 'reducers/filters';
import { accountReducer } from 'reducers/account';
import { domainsReducer } from 'reducers/domains';
import { emailsReducer } from 'reducers/emails';

export function stateReducer(state, action) {
  if (action.type == INITIALIZE_STATE) return action.state;
  else if (state == undefined) return {};

  return {
    modifiers: modifiersReducer(state.modifiers, action),
    messages: messagesReducer(state.messages, action),
    welcome: action.type == HIDE_WELCOME ? false : state.welcome,
    filters: filtersReducer(state.filters, action),
    account: accountReducer(state.account, action),
    domains: domainsReducer(state.domains, action),
    emails: emailsReducer(state.emails, action)
  };
}
