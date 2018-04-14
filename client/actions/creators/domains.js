import { ADD_DOMAIN } from 'actions/types/domains';

export function addDomain(data) {
  return { type: ADD_DOMAIN, data };
}
