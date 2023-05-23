import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PoolOperations } from './dataPoolOperations';

describe('PoolOperations', () => {
  let service: PoolOperations;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PoolOperations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
