import { CHANGE_VIEW } from 'constants/actions';

export function changeView(view) {
  return {
    type: CHANGE_VIEW,
    view
  };
}
