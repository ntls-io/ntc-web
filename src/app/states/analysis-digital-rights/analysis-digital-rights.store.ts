import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { AnalysisDigitalRight } from './analysis-digital-right.model';

export interface AnalysisDigitalRightsState extends EntityState<AnalysisDigitalRight> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'analysis-digital-rights'
})
export class AnalysisDigitalRightsStore extends EntityStore<AnalysisDigitalRightsState> {

  constructor() {
    super();
  }

}
