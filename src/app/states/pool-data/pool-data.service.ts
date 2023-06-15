import { Injectable } from '@angular/core';
import { PoolData } from './pool-data.model';
import { PoolDataStore } from './pool-data.store';

@Injectable({ providedIn: 'root' })
export class PoolDataService {
  constructor(private poolDataStore: PoolDataStore) {}

  createPool(data: PoolData) {
    this.poolDataStore.add(data);
  }
}
