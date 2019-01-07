import { stateReducer } from 'reducers/index';

const listeners = [];
let state = {};

export class Store {
  /** @param {object} action */
  static dispatch(action) {
    state = stateReducer(state, action);
    for (let listener of listeners) listener(state);
  }

  /** @param {func} fn */
  static subscribe(fn) {
    listeners.push(fn);
  }
}
