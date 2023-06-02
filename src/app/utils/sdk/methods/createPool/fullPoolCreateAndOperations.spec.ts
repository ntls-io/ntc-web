import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import algosdk from 'algosdk';
import { throwError } from 'rxjs/internal/observable/throwError';
import { PoolOperations } from '../dataPoolOperations/dataPoolOperations';
import { PoolCreate } from './createPool';

class CustomReporter implements jasmine.CustomReporter {
  specDone(result: jasmine.SpecResult): void {
    const logs = result.failedExpectations.map(
      expectation => expectation.message
    );
    logs.forEach(log => console.log(log));
  }
}

describe('PoolCreation', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000; //50 seconds
  const baseServer = 'https://testnet-algorand.api.purestake.io/ps2';
  const port = '';
  const token = {
    'X-API-Key': 'J7eo2jPb5m4OiBneIV6r0ajgRLeSaHqk3QplGETk'
  };

  const client = new algosdk.Algodv2(token, baseServer, port);

  const creatorAddr =
    'IVPWWZ3GPJ4G2OMR4DMKMRZTOMI6XG57AC7TLS47UCIRTA3X5D4OQCLTDQ';
  const creator_vault_id = 'alex+17@ntls.io';
  const auth_password = 'password';

  const analystAddr =
    'PGTCYMAMAEMGB6UGAUQORP2MCQFKLUMTWVESERYLKMBOLYJLLXY3XIXBU4';
  const analyst_vault_id = 'analyst+1@ntls.io';
  const analyst_auth_password = 'password';

  // Generate a new Algorand account for the enclave DEMO
  //const enclaveAccount = algosdk.generateAccount();
  const enclaveMnemonic =
    'oxygen wrestle vibrant clog rule often oppose decade color edge glove sphere defy chat divert oyster garbage diary decrease cushion buddy slush raise abandon census';
  const enclaveAccount = algosdk.mnemonicToSecretKey(enclaveMnemonic);
  const enclaveAddr = enclaveAccount.addr;

  //generate test accounts with no enclave signing
  const creatorTestMnemonic =
    'earth squeeze correct frog casino pig trophy device else distance swear trick tag cinnamon actress scale grow boring option couple hockey neck blanket above among';
  const creatorTestAccount = algosdk.mnemonicToSecretKey(creatorTestMnemonic);
  const creatorTestAddr = creatorTestAccount.addr;

  let myService: PoolCreate;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let poolOperationsService: PoolOperations;

  // Data Pool constants
  let dataPool: { appID: any; contributorCreatorID: any; appendDrtID: any };
  let drtID;

  beforeAll(() => {
    jasmine.getEnv().addReporter(new CustomReporter());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        PoolCreate,
        PoolOperations,
        HttpClient // Add any additional providers here
      ]
    });
    myService = TestBed.inject(PoolCreate);
    httpClient = TestBed.inject(HttpClient);
    poolOperationsService = TestBed.inject(PoolOperations);
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
  // it('should create a Data Pool', async () => {
  //   dataPool = await myService.createDataPoolMethod(
  //     client,
  //     enclaveAccount,
  //     creatorAddr,
  //     enclaveAddr,
  //     creator_vault_id,
  //     auth_password
  //   );

  //   // Assert
  //   expect(dataPool).toBeDefined();
  //   expect(dataPool.appID).toEqual(jasmine.any(Number));
  //   expect(dataPool.appID).toBeGreaterThan(0);
  //   expect(dataPool.contributorCreatorID).toEqual(jasmine.anything());
  //   expect(dataPool.appendDrtID).toEqual(jasmine.any(Number));
  //   console.log('DataPool details: ', dataPool);
  // });

  // it('should create and store a DRT in box storage', async () => {
  //   let appID = 225401830;
  //   let contributorCreatorID = 225401911;
  //   let appendDrtID = 225401910;
  //   // Fetch the file content
  //   drtID = await poolOperationsService.createDRTMethod(
  //     creatorAddr,
  //     appID,
  //     client,
  //     'testDRT_2',
  //     10,
  //     1000000,
  //     'drt_binary',
  //     'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  //     creator_vault_id,
  //     auth_password
  //   );
  //   console.log(drtID);
  // });
  // it('should buy a DRT', async () => {
  //   jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
  //   // Fetch the file content
  //   let drtID = 225402580;
  //   let appID = 225401830;
  //   let contributorCreatorID = 225361360;
  //   let appendDrtID = 225361359;

  //   const buyDRT = await poolOperationsService.buyDRTMethod(
  //     client,
  //     appID,
  //     analystAddr,
  //     drtID,
  //     1,
  //     1000000,
  //     analyst_vault_id,
  //     analyst_auth_password
  //   );
  //   console.log(buyDRT);
  // });

  // it('should de list and list a DRT', async () => {
  //   jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
  //   // Fetch the file content
  //   let drtID = 225402580;
  //   let appID = 225401830;
  //   let contributorCreatorID = 225361360;
  //   let appendDrtID = 225361359;

  //   const txn = await poolOperationsService.delistDRTMethod(
  //     client,
  //     appID,
  //     creatorAddr,
  //     drtID,
  //     creator_vault_id,
  //     auth_password
  //   );

  //   const txn2 = await poolOperationsService.listDRTMethod(
  //     client,
  //     appID,
  //     creatorAddr,
  //     drtID,
  //     creator_vault_id,
  //     auth_password
  //   );
  // });
});
