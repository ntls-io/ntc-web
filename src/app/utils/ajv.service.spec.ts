import { TestBed } from '@angular/core/testing';

import { AjvService } from './ajv.service';

describe('AjvService', () => {
  let service: AjvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AjvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
