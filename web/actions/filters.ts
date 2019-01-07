import {
  LOAD_FILTERS,
  ADD_FILTER,
  DELETE_FILTER,
  EDIT_FILTER
} from 'constants/actions';

export function loadFilters(filters) {
  return {
    type: LOAD_FILTERS,
    filters
  };
}

export function deleteFilter(id) {
  return {
    type: DELETE_FILTER,
    id
  };
}

export function addFilter(data) {
  return {
    type: ADD_FILTER,
    data
  };
}

export function editFilter(data) {
  return {
    type: EDIT_FILTER,
    data
  };
}
