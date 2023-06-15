import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { PoolDataStore, PoolDataState } from './pool-data.store';

@Injectable({ providedIn: 'root' })
export class PoolDataQuery extends QueryEntity<PoolDataState> {

  constructor(protected store: PoolDataStore) {
    super(store);
  }

}
