import algosdk, { getApplicationAddress } from 'algosdk';
import { createDataPoolMethod } from '../src/app/utils/sdk/methods/createPool';
import { testPayment } from '../src/app/utils/sdk/sdkTest';

test('Smart Contract Creation ', async () => {
  // inside here you'll write the tests for this module, you can use both test() or it(())
  const creatorMnemonic =
    'asthma genuine aunt dumb concert solar blast spy monster before sudden census denial hope cost wasp legal system angle soup evolve young guilt able width';
  const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  const enclaveAccount = algosdk.generateAccount();
  const enclaveSecret = enclaveAccount.sk;
  // Client setup, get these values from process env files instead
  const algodToken =
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const baseServer = 'http://localhost';
  const port = '4001';
  // const headers = { "X-API-Key": process.env.REACT_APP_API_KEY };
  const client = new algosdk.Algodv2(algodToken, baseServer, port);

  console.log('\nCreate algorand sandbox client');
  console.log(client.genesis);
  console.log('\nCreate Test Accounts');
  console.log(
    'Creator Account: ',
    creatorAccount.addr,
    '\nEncalve Account: ',
    enclaveAccount.addr
  );
  console.log('\nFund Test Accounts');

  testPayment(creatorAccount, 1000000, enclaveAccount, client);

  const dataPool = await createDataPoolMethod(
    creatorAccount,
    enclaveAccount,
    client
  );

  const smartContractAddress = getApplicationAddress(dataPool?.appID);
  console.log('\nCreate Data Pool');

  console.log(
    'Data Pool Info ',
    '\nSmart Contract ID: ',
    dataPool?.appID,
    '\nSmart Contract Address: ',
    smartContractAddress,
    '\nAppend DRT ID: ',
    dataPool?.appendDrtID,
    '\nCreators Contributor Token ID: ',
    dataPool?.contributorCreatorID
  );
});

// // get test accounts from mnemonic d`
// const creatorMnemonic =
//   'asthma genuine aunt dumb concert solar blast spy monster before sudden census denial hope cost wasp legal system angle soup evolve young guilt able width';

// const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
// const enclaveAccount = algosdk.generateAccount();
// const enclaveSecret = enclaveAccount.sk;

// // Client setup, get these values from process env files instead
// const algodToken =
//   'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
// const baseServer = 'http://localhost';
// const port = '4001';
// // const headers = { "X-API-Key": process.env.REACT_APP_API_KEY };
// const client = new algosdk.Algodv2(algodToken, baseServer, port);
// // const client = new algosdk.Algodv2(environment.algod.algodToken , environment.algod.baseServer, environment.algod.port);
// // fund test account
// const fundEnclaveTestAccount = async () => {
//   const params = await client.getTransactionParams().do();
//   const onComplete = algosdk.OnApplicationComplete.NoOpOC;

//   params.fee = 1000;

//   params.flatFee = true;

//   const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
//     from: creatorAccount.addr,
//     to: enclaveAccount.addr,
//     amount: 1000000,
//     suggestedParams: params,
//   });

//   const ptxnID = ptxn.txID().toString();
//   // Sign the transaction, here we have to intervene
//   const creatorSecret = creatorAccount.sk;
//   const signedPtxn = ptxn.signTxn(creatorSecret);

//   await client.sendRawTransaction(signedPtxn).do();
//   // Wait for transaction to be confirmed
//   const confirmedTxn = await algosdk.waitForConfirmation(client, ptxnID, 4);
//   return confirmedTxn;
// };

// // const testCreateDataPoolMethod = async () => {

// //   /// Transaction 1 - Deploy Contract
// //   const txn1 = await createDeployContractTxn(creatorAccount, enclaveAccount, client);
// //   // console.log(txn1);
// //   const txId_1 = await txn1.txID().toString();

// //   // Sign the transaction, here we have to intervene
// //   const creatorSecret = creatorAccount.sk;
// //   const signedtxn1 = txn1.signTxn(creatorSecret);
// //   // pai(username, password, signedTxn)
// //   // intervene above with authenticateion

// //   const appID = await sendDeployContractTxn(signedtxn1, client, txId_1);
// //   // console.log(appID);

// //   /// Transaction 2 - Fund Contract
// //   var fundAmount = 1000000;
// //   const txn2 = await createFundContractTxn(appID, fundAmount, creatorAccount, client);
// //   // console.log(txn2);
// //   var txId_2 = await txn2.txID().toString();
// //   // Sign the transaction, here we have to intervene
// //   const signedtxn2 = txn2.signTxn(creatorSecret);
// //   // console.log(signedtxn2);
// //   const txn2Result = await sendFundContractTxn(signedtxn2, client, txId_2, creatorAccount, appID, fundAmount);

// //   /// Transaction 3 - Setup Data Pool
// //   var noRowsContributed = 4;
// //   var dataPoolHash = 'HBKHJB-DataPool-DJKDB';
// //   var appendDRTName = 'Append DRT';
// //   var appendDRTUnitName = 'DRT';
// //   var appendDRTSupply = 1;
// //   var appendDRTPrice = 1000000;
// //   var appendDRTurlBinary = 'https://url_append_binary';
// //   var appendDRTBinaryHash = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// //   const txn3 = await DEMO_createSetupDataPoolTxn(
// //     appID,
// //     enclaveAccount,
// //     client,
// //     creatorAccount,
// //     noRowsContributed,
// //     dataPoolHash,
// //     appendDRTName,
// //     appendDRTUnitName,
// //     appendDRTSupply,
// //     appendDRTPrice,
// //     appendDRTurlBinary,
// //     appendDRTBinaryHash
// //   );
// //   // console.log(txn3);
// //   var txId_3 = await txn3.txID().toString();
// //   //Sign the transaction, here we have to intervene
// //   const signedtxn3 = txn3.signTxn(enclaveSecret);

// //   const [appendDRT,contributorCreatorID] = await sendSetupDataPoolTxn(signedtxn3, client, txId_3);

// //   // transaction 4 - Optin to contributor token
// //   const txn4 = await createAssetOptinTxn(contributorCreatorID, creatorAccount, client);
// //   // console.log(txn2);
// //   var txId_4 = await txn4.txID().toString();
// //   // Sign the transaction, here we have to intervene
// //   const signedtxn4 = txn4.signTxn(creatorSecret);
// //   // console.log(signedtxn2);
// //   const txn4Result = await sendAssetOptinTxn(signedtxn4, client, txId_4, creatorAccount, appID, fundAmount);

// //   // Transaction 5 - claim contributor token
// //   const txn5 = await createInitClaimContributorTxn(appID, client, creatorAccount, contributorCreatorID, appendDRT);
// //   // console.log(txn2);
// //   // console.log(txn5);
// //   var txId_5 = await txn5.txID().toString();
// //   // Sign the transaction, here we have to intervene
// //   const signedtxn5 = txn5.signTxn(creatorSecret);
// //   // console.log(signedtxn2);
// //   const txn5Result = await sendInitClaimContributorTxn(signedtxn5, client, txId_5);
// //   // console.log(txn5Result);

// // };
