// Action creators
import { changeView } from 'actions/creators/index';

// Constants
import * as VIEWS from 'constants/views';

export default function(store) {
  // Hash is empty or not set
  if (location.hash.length < 2) {
    store.dispatch(changeView(VIEWS.CREATE_REDIRECT_EMAIL));
    return;
  }

  const state = store.getState();
  const hash = location.hash
    .substr(2)
    .split('?')[0]
    .split('/');

  switch (hash[0]) {
    // Update state to reflect hash
    case 'account':
      switch (hash[1]) {
        case 'purchase-subscription':
          return store.dispatch(changeView(VIEWS.PURCHASE_SUBSCRIPTION));
        case 'primary-emails':
          return store.dispatch(changeView(VIEWS.PRIMARY_EMAILS));
        default:
          return store.dispatch(changeView(VIEWS.ACCOUNT));
      }
    case 'filters':
      switch (hash[1]) {
        case 'create':
          return store.dispatch(changeView(VIEWS.CREATE_FILTER));
        case 'edit':
          return store.dispatch(changeView(VIEWS.EDIT_FILTER));
        case 'list':
          return store.dispatch(changeView(VIEWS.LIST_FILTERS));
      }
    case 'modifiers':
      switch (hash[1]) {
        case 'create':
          return store.dispatch(changeView(VIEWS.CREATE_MODIFIER));
        case 'edit':
          return store.dispatch(changeView(VIEWS.EDIT_MODIFIER));
        case 'list':
          return store.dispatch(changeView(VIEWS.LIST_MODIFIERS));
      }
    case 'emails':
      if (hash[1] == 'messages') {
        switch (hash[3]) {
          case 'send':
            return store.dispatch(changeView(VIEWS.SEND_MESSAGE));
          case 'list':
            return store.dispatch(changeView(VIEWS.LIST_MESSAGES));
          case 'view':
            return store.dispatch(changeView(VIEWS.VIEW_MESSAGE));
        }
      } else {
        switch (hash[1]) {
          case 'create':
            return store.dispatch(changeView(VIEWS.CREATE_REDIRECT_EMAIL));
          case 'edit':
            return store.dispatch(changeView(VIEWS.EDIT_REDIRECT_EMAIL));
          case 'list':
            return store.dispatch(changeView(VIEWS.LIST_REDIRECT_EMAILS));
        }
      }
    case 'domains':
      switch (hash[1]) {
        case 'add':
          return store.dispatch(changeView(VIEWS.ADD_DOMAIN));
        case 'list':
        case undefined:
          return store.dispatch(changeView(VIEWS.LIST_DOMAINS));
        default:
          return store.dispatch(changeView(VIEWS.VIEW_DOMAIN));
      }
    case 'docs':
      return store.dispatch(changeView(VIEWS.DOCUMENTATION));
    case 'quick-search':
      return store.dispatch(changeView(VIEWS.QUICK_SEARCH));
    default:
      return store.dispatch(changeView(VIEWS.CREATE_REDIRECT_EMAIL));
  }
}
