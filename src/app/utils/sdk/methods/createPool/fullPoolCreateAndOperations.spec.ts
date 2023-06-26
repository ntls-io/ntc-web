import { HttpClient, HttpClientModule } from '@angular/common/http';
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

  // test accounts created using our register vault web page
  // these test accounts were funded using the algorand dispenser
  // if there are issues, add funds to accounts using the dispenser before logging the issue
  const creatorAddr =
    'IVPWWZ3GPJ4G2OMR4DMKMRZTOMI6XG57AC7TLS47UCIRTA3X5D4OQCLTDQ';
  const creator_vault_id = 'alex+17@ntls.io';
  const auth_password = 'password';

  const analystAddr =
    'PGTCYMAMAEMGB6UGAUQORP2MCQFKLUMTWVESERYLKMBOLYJLLXY3XIXBU4';
  const analyst_vault_id = 'analyst+1@ntls.io';
  const analyst_auth_password = 'password';

  const enclaveMnemonic =
    'oxygen wrestle vibrant clog rule often oppose decade color edge glove sphere defy chat divert oyster garbage diary decrease cushion buddy slush raise abandon census';
  const enclaveAccount = algosdk.mnemonicToSecretKey(enclaveMnemonic);
  const enclaveAddr = enclaveAccount.addr;
  const enclaveSecret = enclaveAccount.sk;

  //generate nautilus company test account (no enclave signing needed)
  const nautilusMnemonic =
    'earth squeeze correct frog casino pig trophy device else distance swear trick tag cinnamon actress scale grow boring option couple hockey neck blanket above among';
  const nautilusAccount = algosdk.mnemonicToSecretKey(nautilusMnemonic);
  const nautilusAddr = nautilusAccount.addr;

  let myService: PoolCreate;
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
  fit('the creator test account should create a Data Pool', async () => {
    try {
      dataPool = await myService.createDataPoolMethod(
        client,
        enclaveAccount,
        creatorAddr,
        enclaveAddr,
        nautilusAddr,
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
  fit('the creator test account should create and then store a DRT in box storage', async () => {
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
  fit('the analyst test account should buy the newly created DRT', async () => {
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

      let aamt = buyDRT!['inner-txns'][0]['txn']['txn']['aamt'];
      let xaid = buyDRT!['inner-txns'][0]['txn']['txn']['xaid'];
      let analyst_txn_address = algosdk.encodeAddress(
        buyDRT!['inner-txns'][0]['txn']['txn']['arcv']
      );

      // Check if buyDRT is successful
      expect(buyDRT).toBeDefined();
      // check network transaction response
      expect(aamt).toBe(1); // asset amount bought matches
      expect(xaid).toBe(drtID); // asset id matches
      expect(analyst_txn_address).toBe(analystAddr); // buyers address matches

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
  fit('the analyst test account should join the data pool as a pending contributor', async () => {
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

      let aamt = joinDataPool!['txn']['txn']['aamt'];
      let xaid = joinDataPool!['txn']['txn']['xaid'];
      let contract_txn_address = algosdk.encodeAddress(
        joinDataPool!['txn']['txn']['arcv']
      );
      let contributor_txn_address = algosdk.encodeAddress(
        joinDataPool!['txn']['txn']['snd']
      );
      let contractAddr = algosdk.getApplicationAddress(dataPool.appID);

      // Check if buyDRT is successful
      expect(joinDataPool).toBeDefined();
      // check network transaction response
      expect(aamt).toBe(1); // asset amount matches
      expect(xaid).toBe(dataPool?.appendDrtID); // asset id of append DRT matches
      expect(contributor_txn_address).toBe(analystAddr); // contributor address matches
      expect(contract_txn_address).toBe(contractAddr); // receiver/contract address matches

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
  fit('the enclave test account should approve the data contribution by the pending contributor, DEMO enclave transaction', async () => {
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
      expect(contributorAnalystID).toBeGreaterThan(0);

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
  fit('the analyst test account claim the contributor token issed by the data pool smart contract', async () => {
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

      let contractAddr = algosdk.getApplicationAddress(dataPool.appID);
      let aamt = claimContributorToken!['inner-txns'][0]['txn']['txn']['aamt'];
      let xaid = claimContributorToken!['inner-txns'][0]['txn']['txn']['xaid'];
      let contributor_txn_address = algosdk.encodeAddress(
        claimContributorToken!['inner-txns'][0]['txn']['txn']['arcv']
      );
      let contract_txn_address = algosdk.encodeAddress(
        claimContributorToken!['inner-txns'][0]['txn']['txn']['snd']
      );

      // Check if claim contributor is successfull
      expect(claimContributorToken).toBeDefined();
      expect(aamt).toBe(1); // asset amount matches
      expect(xaid).toBe(contributorAnalystID); // asset id of contributor ID matches
      expect(contributor_txn_address).toBe(analystAddr); // receiver of contributor address matches contributors
      expect(contract_txn_address).toBe(contractAddr); // sender of asset address matches contract address
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
  fit('the creator test account should claim back their royalties', async () => {
    try {
      const claimRoyalty_txn = await poolOperationsService.claimRoyaltiesMethod(
        client,
        dataPool.appID,
        creatorAddr,
        dataPool.contributorCreatorID,
        creator_vault_id,
        auth_password
      );
      let contractAddr = algosdk.getApplicationAddress(dataPool.appID);
      let amt = claimRoyalty_txn!['inner-txns'][0]['txn']['txn']['amt'];
      let receiver = algosdk.encodeAddress(
        claimRoyalty_txn!['inner-txns'][0]['txn']['txn']['rcv']
      );
      let sender = algosdk.encodeAddress(
        claimRoyalty_txn!['inner-txns'][0]['txn']['txn']['snd']
      );

      // Check if claim contributor is successfull
      expect(claimRoyalty_txn).toBeDefined();
      expect(amt).toBeGreaterThan(0); // royalty fee paoyment greater than 0
      expect(receiver).toBe(creatorAddr); // receiver of fee address matches creators
      expect(sender).toBe(contractAddr); // sender of fee address matches contract address
      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in claimRoyaltiesMethod:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending('Skipping the remaining tests due to error claimRoyaltiesMethod');
    }
  }, 50000);
  fit('the analyst test account should execute a DRT', async () => {
    try {
      const redeemDRT_txn = await poolOperationsService.redeemDRTMethod(
        client,
        analystAddr,
        dataPool.appID,
        drtID,
        1,
        3000000,
        analyst_vault_id,
        analyst_auth_password
      );

      let contractAddr = algosdk.getApplicationAddress(dataPool.appID);
      let aamt = redeemDRT_txn!['txn']['txn']['aamt'];
      let xaid = redeemDRT_txn!['txn']['txn']['xaid'];
      let contract_txn_address = algosdk.encodeAddress(
        redeemDRT_txn!['txn']['txn']['arcv']
      ); // receiver of asset is the contract
      let redeemer_txn_address = algosdk.encodeAddress(
        redeemDRT_txn!['txn']['txn']['snd']
      ); // sender of asset is the redeemer

      // Check if DRT Redemption is successfull
      expect(redeemDRT_txn).toBeDefined();
      expect(aamt).toBe(1); // asset amount matches txn
      expect(xaid).toBe(drtID); // asset id of DRT matches txn
      expect(redeemer_txn_address).toBe(analystAddr); // sender of asset address matches redeemer
      expect(contract_txn_address).toBe(contractAddr); // receiver of asset address matches contract address

      // Proceed to the next test case
    } catch (error) {
      console.error('Error occurred in redeemDRTMethod:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending('Skipping the remaining tests due to error redeemDRTMethod');
    }
  }, 50000);
  fit('the nautilus test account should claim back their royalties', async () => {
    try {
      const encoder = new TextEncoder();
      const appArgs = [encoder.encode('nautilus_claim')];

      const params = await client.getTransactionParams().do();

      const onComplete = algosdk.OnApplicationComplete.NoOpOC;

      params.fee = 1000;
      params.flatFee = true;

      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: nautilusAddr,
        appIndex: Number(dataPool.appID),
        suggestedParams: params,
        onComplete: onComplete,
        appArgs: appArgs
      });

      let txnID = txn!.txID().toString();
      let signedTxn = txn.signTxn(nautilusAccount.sk);
      await client.sendRawTransaction(signedTxn).do();
      // Wait for transaction to be confirmed
      const confirmedTxn = await algosdk.waitForConfirmation(client, txnID, 4);
      console.log(
        'Nautilus DEMO account claim fees transaction : ' +
          txnID +
          ' confirmed in round ' +
          confirmedTxn['confirmed-round']
      );
      const transactionResponse = await client
        .pendingTransactionInformation(txnID)
        .do();

      let contractAddr = algosdk.getApplicationAddress(dataPool.appID);
      let amt = transactionResponse!['inner-txns'][0]['txn']['txn']['amt'];
      let receiver = algosdk.encodeAddress(
        transactionResponse!['inner-txns'][0]['txn']['txn']['rcv']
      );
      let sender = algosdk.encodeAddress(
        transactionResponse!['inner-txns'][0]['txn']['txn']['snd']
      );

      // Check if nautilus claimed fees successfully
      expect(transactionResponse).toBeDefined();
      expect(amt).toBeGreaterThan(0); // royalty fee payment greater than 0
      expect(receiver).toBe(nautilusAddr); // receiver of fee address matches creators
      expect(sender).toBe(contractAddr); // sender of fee address matches contract address
    } catch (error) {
      console.error('Error occurred in claimNautilusFee:', error);
      // Fail the test if an error occurs
      expect(error).toBeUndefined();

      // Skip the remaining tests
      pending('Skipping the remaining tests due to error claimNautilusFee');
    }
  }, 50000);
});
