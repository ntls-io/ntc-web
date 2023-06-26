import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { DigitalRightsStore, DigitalRightsState } from './digital-rights.store';

@Injectable({ providedIn: 'root' })
export class DigitalRightsQuery extends QueryEntity<DigitalRightsState> {

  constructor(protected store: DigitalRightsStore) {
    super(store);
  }

}
