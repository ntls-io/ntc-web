import { TestBed } from '@angular/core/testing';

import { EnclaveService } from './enclave.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EnclaveService', () => {
  let service: EnclaveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(EnclaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
