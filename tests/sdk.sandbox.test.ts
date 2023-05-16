import algosdk, { getApplicationAddress } from 'algosdk';
import { createDataPoolMethod } from '../src/app/utils/sdk/methods/createPool';
import {
  buyDRTMethod,
  claimContributorMethod,
  createDRTMethod,
  delistDRTMethod,
  joinPoolPendingMethod,
  listDRTMethod,
  redeemDRTMethod
} from '../src/app/utils/sdk/methods/dataPoolOperations';
import { DEMO_approvalContributorTransaction } from '../src/app/utils/sdk/sdkTest';

test('Testnet: Smart Contract Creation ', async () => {
  // setup client to sandbox
  const algodToken =
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const baseServer = 'http://localhost';
  const port = '4001';
  const client = new algosdk.Algodv2(algodToken, baseServer, port);

  // Import Testnet Accounts
  const enclaveMnemonic =
    'asthma genuine aunt dumb concert solar blast spy monster before sudden census denial hope cost wasp legal system angle soup evolve young guilt able width';
  const enclaveAccount = algosdk.mnemonicToSecretKey(enclaveMnemonic);
  const enclaveAddr = enclaveAccount.addr;
  let enclaveAccountInfo = await client.accountInformation(enclaveAddr).do();
  console.log(
    'Enclave Account address: ',
    enclaveAddr,
    '\nEnclave Account balance: ',
    enclaveAccountInfo['amount']
  );

  const analystMnemonic =
    'degree wedding board canoe unit iron patient apple law defense goose cushion obtain copper barrel erosion casual strike decrease fork crystal magic bus abandon essay';
  const analystAccount = algosdk.mnemonicToSecretKey(analystMnemonic);
  const analystAddr = analystAccount.addr;
  let analystAccountInfo = await client.accountInformation(analystAddr).do();
  console.log(
    'Analyst Account address: ',
    analystAddr,
    '\nAnaylst Account balance: ',
    analystAccountInfo['amount']
  );

  const creatorMnemonic =
    'mandate response curve hunt century approve infant spoil donkey negative hidden cricket erode daring begin enough stove basket turkey tool still series similar abstract manual';
  const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  const creatorAddr = creatorAccount.addr;
  let creatorAccountInfo = await client.accountInformation(creatorAddr).do();
  console.log(
    'Creator Account address: ',
    creatorAddr,
    '\nCreator Account balance: ',
    creatorAccountInfo['amount']
  );

  // create data pool
  let dataPool = await createDataPoolMethod(
    client,
    creatorAccount, // TBR
    enclaveAccount, // TBR
    creatorAddr,
    enclaveAddr
  );

  const smartContractAddress = getApplicationAddress(dataPool?.appID);

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

  const drtID = await createDRTMethod(
    creatorAccount, //TBR
    creatorAddr,
    dataPool?.appID,
    client,
    'testDRT',
    10,
    1000000,
    'drt_binary',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  );
  console.log('DRT Created with ID: ', drtID);

  // analyst buys DRT
  const buydrt = await buyDRTMethod(
    client,
    dataPool?.appID,
    analystAccount, // TBR
    analystAddr,
    drtID,
    1,
    1000000
  );
  console.log('Buy DRT confirmed in round : ', buydrt!['confirmed-round']);

  // delist
  const delistDRT = await delistDRTMethod(
    client,
    dataPool?.appID,
    creatorAccount, // TBR
    creatorAddr,
    drtID
  );
  console.log(
    'De-list drt confirmed in round : ',
    delistDRT!['confirmed-round']
  );

  // list
  const listDRT = await listDRTMethod(
    client,
    dataPool?.appID,
    creatorAccount, // TBR
    creatorAddr,
    drtID
  );
  console.log('Re-list drt confirmed in round : ', listDRT!['confirmed-round']);

  // analyst buys DRT again
  const buydrt2 = await buyDRTMethod(
    client,
    dataPool?.appID,
    analystAccount,
    analystAddr,
    drtID,
    1,
    1000000
  );

  console.log(
    'Buy Transaction confirmed in round: ',
    buydrt2!['confirmed-round']
  );

  // join Data Pool step 1 - add user as pending contributor
  const addPendingContributor = await joinPoolPendingMethod(
    client,
    analystAccount, // TBR
    analystAddr,
    dataPool?.appID,
    dataPool?.appendDrtID,
    1,
    1000000,
    3000000
  );
  console.log(
    'Add user as pending contributor confirmed in round: ',
    addPendingContributor!['confirmed-round']
  );

  // TBR - DEMO enclave approval of contributor
  const demoApproval = await DEMO_approvalContributorTransaction(
    client,
    dataPool?.appID,
    enclaveAccount,
    analystAccount
  );
  const contributorTokenID = demoApproval!['inner-txns'][0]['asset-index'];
  console.log(
    'Enclave Approval confirmed in round: ',
    demoApproval!['confirmed-round'],
    '\nContributor Token ID: ',
    contributorTokenID
  );

  // Claim Contributor Token after contribution
  const claimContributor = await claimContributorMethod(
    client,
    dataPool?.appID,
    analystAccount, // TBR
    analystAddr,
    contributorTokenID
  );
  console.log(
    'Claimed contributor token confirmed in round : ',
    claimContributor!['confirmed-round']
  );

  // Redeem DRT
  const redeemDRT = await redeemDRTMethod(
    client,
    analystAccount,
    analystAddr,
    dataPool?.appID,
    drtID,
    1,
    1000000
  );
  console.log(
    'Redeemed DRT transaction confirmed in round : ',
    redeemDRT!['confirmed-round']
  );
}, 300000);
