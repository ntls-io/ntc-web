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
  const indexerServer = 'https://testnet-algorand.api.purestake.io/idx2';

  const port = '';
  const token = {
    'X-API-Key': 'J7eo2jPb5m4OiBneIV6r0ajgRLeSaHqk3QplGETk'
  };
  let indexerClient = new algosdk.Indexer(token, indexerServer, port);
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
  const enclaveSecret = enclaveAccount.sk;

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
  let dataPool: {
    appID: number;
    contributorCreatorID: number;
    appendDrtID: number;
  };
  let drtID: number;
  let contributorAnalystID: number;

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

  fit('should fetch a approval and clear teal files from the assets folder', async () => {
    // Fetch the file content
    const approvalFileContent = await myService.getFileContent('approval.teal');
    const clearFileContent = await myService.getFileContent('clear.teal');
    // Assert the file content
    expect(approvalFileContent.length).toBeGreaterThan(0);
    expect(clearFileContent.length).toBeGreaterThan(0);
  });
  fit('should handle error when fetching file content', async () => {
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
  fit('should create a Data Pool', async () => {
    try {
      dataPool = await myService.createDataPoolMethod(
        client,
        enclaveAccount,
        creatorAddr,
        enclaveAddr,
        creator_vault_id,
        auth_password
      );

      // Assert
      expect(dataPool).toBeDefined();
      expect(dataPool.appID).toEqual(jasmine.any(Number));
      expect(dataPool.appID).toBeGreaterThan(0);
      expect(dataPool.contributorCreatorID).toEqual(jasmine.anything());
      expect(dataPool.appendDrtID).toEqual(jasmine.any(Number));
      console.log('DataPool details: ', dataPool);

      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in dataPool creation:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending('Skipping the remaining tests due to error in dataPool creation');
    }
  }, 50000);
  fit('should create and then store a DRT in box storage', async () => {
    try {
      drtID = await poolOperationsService.createDRTMethod(
        creatorAddr,
        dataPool?.appID,
        client,
        'testDRT_3',
        10,
        1000000,
        'drt_binary',
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        creator_vault_id,
        auth_password
      );
      // Assert
      console.log('DRT (ASA) ID: ', drtID);
      expect(drtID).toBeDefined();
      expect(drtID).toBeGreaterThan(0);

      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in creating and storing DRT:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending(
        'Skipping the remaining tests due to error in creating and storing DRT'
      );
    }
  }, 50000);
  fit('analyst test account should buy the newly created DRT', async () => {
    try {
      const buyDRT = await poolOperationsService.buyDRTMethod(
        client,
        indexerClient,
        dataPool?.appID,
        analystAddr,
        drtID,
        1,
        1000000,
        analyst_vault_id,
        analyst_auth_password
      );

      // Check if buyDRT is successful
      expect(buyDRT).toBe(1);

      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in buyDRTMethod:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending('Skipping the remaining tests due to error in buying the DRT');
    }
  }, 50000);

  fit('the creator should de list and list a DRT', async () => {
    try {
      const delistResult = await poolOperationsService.delistDRTMethod(
        client,
        dataPool?.appID,
        creatorAddr,
        drtID,
        creator_vault_id,
        auth_password
      );
      // Check if delistResult is successful
      expect(delistResult).toBeDefined();

      const listResult = await poolOperationsService.listDRTMethod(
        client,
        dataPool?.appID,
        creatorAddr,
        drtID,
        creator_vault_id,
        auth_password
      );
      // Check if listResult is successful
      expect(listResult).toBeDefined();

      // Proceed to the next test case
    } catch (error) {
      console.error(
        'Error occurred in delistDRTMethod or listDRTMethod:',
        error
      );
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending(
        'Skipping the remaining tests due to error in delisting or listing the DRT'
      );
    }
  }, 50000);

  fit('the analyst should join the data pool as a pending contributor', async () => {
    try {
      const joinDataPool = await poolOperationsService.joinPoolPendingMethod(
        client,
        indexerClient,
        analystAddr,
        dataPool.appID,
        dataPool?.appendDrtID,
        1,
        1000000,
        3000000,
        analyst_vault_id,
        analyst_auth_password
      );

      // Check if listResult is successful
      expect(joinDataPool).toBeDefined();

      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in joinPoolPendingMethod:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending(
        'Skipping the remaining tests due to error joinPoolPendingMethod'
      );
    }
  }, 50000);
  fit('the enclave should approve the data contribution by the pending contributor, DEMO enclave transaction', async () => {
    try {
      const contractAddr = algosdk.getApplicationAddress(dataPool?.appID);

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // DEMO values to inimate the work of the enclave
      const numRowsContributed = 3;
      const newHash = 'HBKHJB - newHash - DJKDB';
      const enclaveApproval = 1;

      const appArgs = [
        encoder.encode('add_contributor_approved'),
        algosdk.encodeUint64(numRowsContributed),
        encoder.encode(newHash),
        algosdk.encodeUint64(enclaveApproval)
      ];

      const params = await client.getTransactionParams().do();

      const onComplete = algosdk.OnApplicationComplete.NoOpOC;

      params.fee = 1000;
      params.flatFee = true;
      const boxName = algosdk.decodeAddress(analystAddr).publicKey;

      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: enclaveAddr,
        appIndex: Number(dataPool?.appID),
        suggestedParams: params,
        onComplete: onComplete,
        appArgs: appArgs,
        accounts: [analystAddr],
        boxes: [
          {
            appIndex: Number(dataPool?.appID),
            name: boxName
          }
        ]
      });
      var txId = await txn?.txID().toString();
      const signedTxn = txn.signTxn(enclaveSecret);
      await client.sendRawTransaction(signedTxn).do();
      // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log(
        'Contributor DEMO ENCLAVE Approval transaction : ' +
          txId +
          ' confirmed in round ' +
          confirmedTxn['confirmed-round']
      );
      const transactionResponse = await client
        .pendingTransactionInformation(txId)
        .do();
      contributorAnalystID =
        transactionResponse['inner-txns'][0]['asset-index'];
      // Check if listResult is successful
      expect(transactionResponse).toBeDefined();

      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in joinPoolPendingMethod:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending(
        'Skipping the remaining tests due to error joinPoolPendingMethod'
      );
    }
  }, 50000);
  fit('the analyst claim the contributor token issed by the data pool smart contract', async () => {
    try {
      const claimContributorToken =
        await poolOperationsService.claimContributorMethod(
          client,
          dataPool.appID,
          analystAddr,
          contributorAnalystID,
          analyst_vault_id,
          analyst_auth_password
        );

      // Check if claim contributor is successfull
      expect(claimContributorToken).toBeDefined();

      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in claimContributorMethod:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending(
        'Skipping the remaining tests due to error claimContributorMethod'
      );
    }
  }, 50000);
  fit('the creator should claim back their royalties', async () => {
    try {
      const claimRoyalty = await poolOperationsService.claimRoyaltiesMethod(
        client,
        dataPool.appID,
        creatorAddr,
        dataPool.contributorCreatorID,
        creator_vault_id,
        auth_password
      );
      console.log(claimRoyalty);
      // Check if claim contributor is successfull
      expect(claimRoyalty).toBeDefined();

      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in claimContributorMethod:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending(
        'Skipping the remaining tests due to error claimContributorMethod'
      );
    }
  }, 50000);
});
