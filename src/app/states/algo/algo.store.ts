import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface AlgoState {
  accountInformation:
    | any
    | {
        amount: number;
      };
}

export function createInitialState(): AlgoState {
  return {
    accountInformation: undefined
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'algo' })
export class AlgoStore extends Store<AlgoState> {
  constructor() {
    super(createInitialState());
  }
}
