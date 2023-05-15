import algosdk, { getApplicationAddress } from 'algosdk';
import { createDataPoolMethod } from '../src/app/utils/sdk/methods/createPool';
import {
  buyDRTMethod,
  claimContributorMethod,
  createDRTMethod,
  delistDRTMethod,
  joinPoolPendingMethod,
  listDRTMethod
} from '../src/app/utils/sdk/methods/dataPoolOperations';
import { DEMO_approvalContributorTransaction } from '../src/app/utils/sdk/sdkTest';

test('Testnet: Smart Contract Creation ', async () => {
  // setup client to testnet
  //   const baseServer = 'https://testnet-algorand.api.purestake.io/ps2';
  //   const port = '';
  //   const token = {
  //     'X-API-Key': 'J7eo2jPb5m4OiBneIV6r0ajgRLeSaHqk3QplGETk'
  //   };
  const algodToken =
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const baseServer = 'http://localhost';
  const port = '4001';
  const client = new algosdk.Algodv2(algodToken, baseServer, port);

  //   const client = new algosdk.Algodv2(token, baseServer, port);

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

  //   const traderMnemonic =
  //     'pattern setup bacon drop young cupboard easy session north slim blouse ostrich visual orphan step once middle just scissors cave lady slide setup able rib';
  //   const traderAccount = algosdk.mnemonicToSecretKey(traderMnemonic);
  //   const traderAddr = traderAccount.addr;
  //   let traderAccountInfo = await client.accountInformation(traderAddr).do();
  //   console.log(
  //     'Trader Account address: ',
  //     traderAddr,
  //     '\nTrader Account balance: ',
  //     traderAccountInfo['amount']
  //   );

  //   create data pool method
  let dataPool = await createDataPoolMethod(
    creatorAccount,
    enclaveAccount,
    client
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
    creatorAccount,
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
    analystAccount,
    drtID,
    1,
    1000000
  );
  console.log('Buy DRT confirmed in round : ', buydrt!['confirmed-round']);

  // delist test
  const delistDRT = await delistDRTMethod(
    client,
    dataPool?.appID,
    creatorAccount,
    drtID
  );
  console.log(
    'De-list drt confirmed in round : ',
    delistDRT!['confirmed-round']
  );

  //try and buy DRT ( shouldnt be able to unless list again)
  // delist test
  const listDRT = await listDRTMethod(
    client,
    dataPool?.appID,
    creatorAccount,
    drtID
  );
  console.log('Re-list drt confirmed in round : ', listDRT!['confirmed-round']);

  const buydrt2 = await buyDRTMethod(
    client,
    dataPool?.appID,
    analystAccount,
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
    analystAccount,
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

  // DEMO enclave approval of contributor
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
    analystAccount,
    contributorTokenID
  );
  console.log(claimContributor);
}, 300000);
