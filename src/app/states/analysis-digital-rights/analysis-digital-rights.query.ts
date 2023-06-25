import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { AnalysisDigitalRightsStore, AnalysisDigitalRightsState } from './analysis-digital-rights.store';

@Injectable({ providedIn: 'root' })
export class AnalysisDigitalRightsQuery extends QueryEntity<AnalysisDigitalRightsState> {

  constructor(protected store: AnalysisDigitalRightsStore) {
    super(store);
  }

}
