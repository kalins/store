import { Subject } from 'rxjs/Subject';
import { pluck } from 'rxjs/operator/pluck';
import { map } from 'rxjs/operator/map';
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged';
import { Observable } from 'rxjs/Observable';
import { ActionReducer } from './reducer';

export function combineReducers(reducers: any): ActionReducer<any> {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}

export interface SelectSignature<T> {
  <R>(...paths: string[]): Observable<R>;
  <R>(mapFn: (state: T) => R): Observable<R>;
}

export function select<T, R>(pathOrMapFn: any, ...paths: string[]): Observable<R> {
  let mapped$: Observable<R>;

  if (typeof pathOrMapFn === 'string') {
    mapped$ = pluck.call(this, pathOrMapFn, ...paths);
  } else if (typeof pathOrMapFn === 'function') {
    mapped$ = map.call(this, pathOrMapFn);
  } else {
    throw new TypeError(
      `Unexpected type ${typeof pathOrMapFn} in select operator,` +
        ` expected 'string' or 'function'`
    );
  }

  return distinctUntilChanged.call(mapped$);
}

export function Connector(options) {
  return function(constructor: Function) {
    constructor.prototype.componentDestroy = function() {
      this._takeUntilDestroy$ = this._takeUntilDestroy$ || new Subject();
      return this._takeUntilDestroy$.asObservable();
    };

    const $onInit = constructor.prototype.$onInit;

    constructor.prototype.$onInit = function(...arg) {
      for (const key in options) {
        if (options.hasOwnProperty(key)) {
          this[key] = this.Store.select(options[key]);
        }
      }
      $onInit && $onInit.call(this, ...arg);
    };

    const originalDestroy = constructor.prototype.$onDestroy;
    constructor.prototype.$onDestroy = function() {
      originalDestroy && originalDestroy.apply(this, arguments);
      this._takeUntilDestroy$ &&
        this._takeUntilDestroy$.next() &&
        this._takeUntilDestroy$.complete();
    };
  };
}
