import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import algosdk from 'algosdk';
import { throwError } from 'rxjs';
import { PoolCreate } from './createPool';

describe('PoolCreation', () => {
  const baseServer = 'https://testnet-algorand.api.purestake.io/ps2';
  const port = '';
  const token = {
    'X-API-Key': 'J7eo2jPb5m4OiBneIV6r0ajgRLeSaHqk3QplGETk'
  };

  const client = new algosdk.Algodv2(token, baseServer, port);

  const creatorAddr =
    'FRCIQC27FVGJLBVBIPNGU7ZNGK2Z6FNHV4NRF5AK5KEW3UPS7ESMIRZZQI';
  const creator_vault_id = 'alex@ntls.io';
  const auth_password = 'password';
  const enclaveMnemonic =
    'network canal remember oppose actor demise trend wisdom scissors tongue master shed list club try resource recycle foster child slight spawn dash ketchup absorb entry';
  const enclaveAccount = algosdk.mnemonicToSecretKey(enclaveMnemonic);
  const enclaveAddr = enclaveAccount.addr;

  let myService: PoolCreate;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        PoolCreate,
        HttpClient // Add any additional providers here
      ]
    });
    myService = TestBed.inject(PoolCreate);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should fetch a approval and clear teal files from the assets folder', async () => {
    // Fetch the file content
    const approvalFileContent = await myService.getFileContent('approval.teal');
    const clearFileContent = await myService.getFileContent('clear.teal');
    // Assert the file content
    expect(approvalFileContent.length).toBeGreaterThan(0);
    expect(clearFileContent.length).toBeGreaterThan(0);
  });
  it('should handle error when fetching file content', async () => {
    // Mock the error
    const errorMessage = 'Error fetching file content';
    spyOn(httpClient, 'get').and.returnValue(throwError(errorMessage));
    spyOn(console, 'error'); // Spy on console.error to verify it's called

    try {
      // Attempt to fetch the file content
      await myService.getFileContent('approval.teal');
    } catch (error: any) {
      // Verify the error message and console.error was called
      expect(error).toEqual(errorMessage);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching file content:',
        errorMessage
      );
    }
  });
  it('should sign the transaction using the singing service', async () => {
    // Fetch the file content
    const signedtxn = await myService.createDataPoolMethod(
      client,
      enclaveAccount,
      creatorAddr,
      enclaveAddr,
      'alex@ntls.io',
      'password'
    );
    //console.log(signedtxn);
  });
});

// import { TestBed } from '@angular/core/testing';

// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import algosdk from 'algosdk';
// //import * as teal from '../src/assets/contract/approval.teal';
// import { PoolCreation } from './createPool';

// describe('PoolCreation', () => {
//   let service: PoolCreation;
//   const baseServer = 'https://testnet-algorand.api.purestake.io/ps2';
//   const port = '';
//   const token = {
//     'X-API-Key': 'J7eo2jPb5m4OiBneIV6r0ajgRLeSaHqk3QplGETk'
//   };

//   const client = new algosdk.Algodv2(token, baseServer, port);

//   const creatorAddr =
//     'FRCIQC27FVGJLBVBIPNGU7ZNGK2Z6FNHV4NRF5AK5KEW3UPS7ESMIRZZQI';
//   const creator_vault_id = 'alex@ntls.io';
//   const auth_password = 'password';
//   const enclaveMnemonic =
//     'network canal remember oppose actor demise trend wisdom scissors tongue master shed list club try resource recycle foster child slight spawn dash ketchup absorb entry';
//   const enclaveAccount = algosdk.mnemonicToSecretKey(enclaveMnemonic);
//   const enclaveAddr = enclaveAccount.addr;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule]
//     });
//     service = TestBed.inject(PoolCreation);
//     jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   it('Pool Creation test', async () => {
//     //expect(service).toBeTruthy();
//     console.log('creator address: ', creatorAddr);
//     console.log('enclave address: ', enclaveAddr);
//     let result: any;
//     // const appID = await service.createDataPoolMethod(
//     //   client,
//     //   enclaveAccount,
//     //   creatorAddr,
//     //   enclaveAddr,
//     //   creator_vault_id,
//     //   auth_password
//     await service.readTeal().then(data => {
//       result = data;
//     });
//     console.log('teal :', result);
//   });
// });
