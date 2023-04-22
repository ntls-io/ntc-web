import { TestBed } from '@angular/core/testing';

import { EnclaveService } from './enclave.service';

describe('EnclaveService', () => {
  let service: EnclaveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnclaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
