import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AnalysisDigitalRightsStore } from './analysis-digital-rights.store';

@Injectable({ providedIn: 'root' })
export class AnalysisDigitalRightsService {

  constructor(private analysisDigitalRightsStore: AnalysisDigitalRightsStore, private http: HttpClient) {
  }

}
