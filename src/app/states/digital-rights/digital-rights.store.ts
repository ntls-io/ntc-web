import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DigitalRight } from './digital-right.model';

export interface DigitalRightsState extends EntityState<DigitalRight> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'digital-rights'
})
export class DigitalRightsStore extends EntityStore<DigitalRightsState> {

  constructor() {
    super();
  }

}
