import { Subject } from 'rxjs/Subject';

export interface Action {
  type: string;
  payload?: any;
}

export class Dispatcher extends Subject<Action> {
  static INIT = '@ngrx/store/init';

  constructor() {
    super();
  }

  dispatch(action: Action): void {
    this.next(action);
  }

  complete() {
    // noop
  }
}
