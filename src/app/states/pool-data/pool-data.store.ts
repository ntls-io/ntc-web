import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { PoolData } from './pool-data.model';

export interface PoolDataState extends EntityState<PoolData> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'poolData',
  resettable: true
})
export class PoolDataStore extends EntityStore<PoolDataState> {
  constructor() {
    super();
  }
}
