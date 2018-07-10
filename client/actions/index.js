import { CHANGE_VIEW, HIDE_WELCOME } from 'constants/actions';

export function changeView(view) {
  return {
    type: CHANGE_VIEW,
    view
  };
}

export function hideWelcome() {
  return { type: HIDE_WELCOME };
}
