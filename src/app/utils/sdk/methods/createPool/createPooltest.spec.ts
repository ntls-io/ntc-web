import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import algosdk from 'algosdk';
import { throwError } from 'rxjs/internal/observable/throwError';
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
    'FYZ7CG6W3LJV54YW2FUVKYOHABDFQH374L7KYDZ6YCBURWZEWJMSDDVY7A';
  const creator_vault_id = 'alex+1@ntls.io';
  const auth_password = 'password';

  // Generate a new Algorand account for the enclave DEMO
  //const enclaveAccount = algosdk.generateAccount();
  const enclaveMnemonic =
    'oxygen wrestle vibrant clog rule often oppose decade color edge glove sphere defy chat divert oyster garbage diary decrease cushion buddy slush raise abandon census';
  const enclaveAccount = algosdk.mnemonicToSecretKey(enclaveMnemonic);
  const enclaveAddr = enclaveAccount.addr;

  let myService: PoolCreate;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  // Data Pool constants
  let dataPool;

  beforeAll(() => {
    jasmine.getEnv().addReporter(new CustomReporter());
  });

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
  it('should create a Data Pool', async () => {
    dataPool = await myService.createDataPoolMethod(
      client,
      enclaveAccount,
      creatorAddr,
      enclaveAddr,
      creator_vault_id,
      auth_password
    );
    console.log('DataPool details: ', dataPool);
    expect(dataPool).toEqual(jasmine.any(Object));
    expect(dataPool.appID).toEqual(jasmine.any(Number));
    expect(dataPool.appID).toBeGreaterThan(0);
    expect(dataPool.contributorCreatorID).toEqual(jasmine.anything());
    expect(dataPool.appendDrtID).toEqual(jasmine.anything());
  });
  it('should claim contributor token', async () => {
    // Fetch the file content
    let appID = 222466713;
    let contributorCreatorID = 222466808;
    let appendDrtID = 222466807;

    // Transaction 5 - claim contributor token
    const txn5 = await myService.Debug_initclaim(
      client,
      enclaveAccount,
      creatorAddr,
      enclaveAddr,
      creator_vault_id,
      auth_password,
      appID,
      contributorCreatorID,
      appendDrtID
    );
  });
});
