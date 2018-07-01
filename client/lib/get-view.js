// Constants
import * as VIEWS from 'constants/views';

/**
 * Return the application's `state.view`.
 * @param {object} state
 * @return {string}
 */
export default function(state) {
  // Hash is empty or not set
  if (location.hash.length < 2) return VIEWS.CREATE_REDIRECT_EMAIL;

  const hash = location.hash
    .substr(2)
    .split('?')[0]
    .split('/');

  switch (hash[0]) {
    // Update state to reflect hash
    case 'account':
      switch (hash[1]) {
        case 'purchase-subscription':
          return VIEWS.PURCHASE_SUBSCRIPTION;
        case 'primary-emails':
          return VIEWS.PRIMARY_EMAILS;
        default:
          return VIEWS.ACCOUNT;
      }
    case 'filters':
      switch (hash[1]) {
        case 'create':
          return VIEWS.CREATE_FILTER;
        case 'edit':
          return VIEWS.EDIT_FILTER;
        case 'list':
          return VIEWS.LIST_FILTERS;
      }
    case 'modifiers':
      switch (hash[1]) {
        case 'create':
          return VIEWS.CREATE_MODIFIER;
        case 'edit':
          return VIEWS.EDIT_MODIFIER;
        case 'list':
          return VIEWS.LIST_MODIFIERS;
      }
    case 'emails':
      if (hash[1] == 'messages') {
        switch (hash[3]) {
          case 'send':
            return VIEWS.SEND_MESSAGE;
          case 'list':
            return VIEWS.LIST_MESSAGES;
          case 'view':
            return VIEWS.VIEW_MESSAGE;
        }
      } else {
        switch (hash[1]) {
          case 'create':
            return VIEWS.CREATE_REDIRECT_EMAIL;
          case 'edit':
            return VIEWS.EDIT_REDIRECT_EMAIL;
          case 'list':
            return VIEWS.LIST_REDIRECT_EMAILS;
        }
      }
    case 'domains':
      switch (hash[1]) {
        case 'add':
          return VIEWS.ADD_DOMAIN;
        case 'list':
        case undefined:
          return VIEWS.LIST_DOMAINS;
        default:
          return VIEWS.VIEW_DOMAIN;
      }
    case 'docs':
      return VIEWS.DOCUMENTATION;
    case 'quick-search':
      return VIEWS.QUICK_SEARCH;
    default:
      return VIEWS.CREATE_REDIRECT_EMAIL;
  }
}
