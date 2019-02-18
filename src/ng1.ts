import * as angular from 'angular';
import { Reducer } from './reducer';
import { Dispatcher } from './dispatcher';
import { Store } from './store';
import { State } from './state';
import { combineReducers } from './utils';

let ADD_REDUCERS = {};

export const addReducer = function(reducer) {
  ADD_REDUCERS = {...ADD_REDUCERS, ...reducer};
};

export function _initialReducerFactory(reducer) {
  if (typeof reducer === 'function') {
    return reducer;
  }
  return combineReducers({...reducer, ...ADD_REDUCERS});
}

export function _initialStateFactory(initialState, reducer) {
  if (!initialState) {
    return reducer(undefined, { type: Dispatcher.INIT });
  }
  return initialState;
}

export function _storeFactory(dispatcher, reducer, state$) {
  return new Store(dispatcher, reducer, state$);
}

export function _stateFactory(initialState: any, dispatcher: Dispatcher, reducer: Reducer) {
  return new State(initialState, dispatcher, reducer);
}

export function _reducerFactory(dispatcher, reducer) {
  return new Reducer(dispatcher, reducer);
}

angular
  .module('@ngrx/store', [])
  .value('Dispatcher', new Dispatcher())
  .factory('Store', ['Dispatcher', 'Reducer', 'State', _storeFactory])
  .factory('Reducer', ['Dispatcher', 'INITIAL_REDUCER', _reducerFactory])
  .factory('State', ['INITIAL_STATE', 'Dispatcher', 'Reducer', _stateFactory])
  .factory('INITIAL_REDUCER', ['_INITIAL_REDUCER', _initialReducerFactory])
  .factory('INITIAL_STATE', ['_INITIAL_STATE', 'INITIAL_REDUCER', _initialStateFactory])
  .value('_INITIAL_REDUCER', null)
  .value('_INITIAL_STATE', null);
