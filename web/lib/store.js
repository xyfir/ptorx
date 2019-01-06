import reducer from 'reducers/index';

const listeners = [];
let state = {};

export default class Store {
  /** @param {object} action */
  static dispatch(action) {
    state = reducer(state, action);
    for (let listener of listeners) listener(state);
  }

  /** @param {func} fn */
  static subscribe(fn) {
    listeners.push(fn);
  }
}
