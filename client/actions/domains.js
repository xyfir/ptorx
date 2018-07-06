import { ADD_DOMAIN } from 'constants/actions';

export function addDomain(data) {
  return { type: ADD_DOMAIN, data };
}
