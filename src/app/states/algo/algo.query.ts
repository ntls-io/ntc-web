import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { microalgosToAlgos } from 'algosdk';
import { AlgoState, AlgoStore } from './algo.store';

@Injectable({ providedIn: 'root' })
export class AlgoQuery extends Query<AlgoState> {
  balance = this.select(state =>
    microalgosToAlgos(state.accountInformation.amount).toFixed(2)
  );

  constructor(protected algoStore: AlgoStore) {
    super(algoStore);
  }
}
