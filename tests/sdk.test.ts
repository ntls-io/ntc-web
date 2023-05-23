import algosdk, { getApplicationAddress } from 'algosdk';
import { createDataPoolMethod } from '../src/app/utils/sdk/methods/createPool/createPool';
import {
  buyDRTMethod,
  claimContributorMethod,
  createDRTMethod,
  delistDRTMethod,
  joinPoolPendingMethod,
  listDRTMethod,
  redeemDRTMethod
} from '../src/app/utils/sdk/methods/dataPoolOperations/dataPoolOperations';
import { DEMO_approvalContributorTransaction } from '../src/app/utils/sdk/sdkTest';

test('Testnet: Smart Contract Creation ', async () => {
  // setup client to testnet
  const baseServer = 'https://testnet-algorand.api.purestake.io/ps2';
  const port = '';
  const token = {
    'X-API-Key': 'J7eo2jPb5m4OiBneIV6r0ajgRLeSaHqk3QplGETk'
  };

  const client = new algosdk.Algodv2(token, baseServer, port);

  // const http: HttpClient;
  // const enclaveService = new EnclaveService(new HttpClient()); // Create an instance of EnclaveService
  // const poolOperations = new PoolOperations(enclaveService);

  // Use this code to generate new test accounts if the account becomes to large.
  // var account = generateAccount();
  // console.log('address account 1:', account.addr);
  // console.log('mnemonic account 1:', algosdk.secretKeyToMnemonic(account.sk));
  // var account2 = generateAccount();
  // console.log('address account 2:', account2.addr);
  // console.log('mnemonic account 2:', algosdk.secretKeyToMnemonic(account2.sk));
  // var account3 = generateAccount();
  // console.log('address account 3:', account3.addr);
  // console.log('mnemonic account 3:', algosdk.secretKeyToMnemonic(account3.sk));

  // Import Testnet Accounts
  const enclaveMnemonic =
    'network canal remember oppose actor demise trend wisdom scissors tongue master shed list club try resource recycle foster child slight spawn dash ketchup absorb entry';
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
    'soft vivid slow issue dog layer nose couple appear maple hollow people reform question visa soda fossil bleak float host empty denial omit abandon venue';
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
    'boat ride forget when brass safe quantum draw punch special slow example increase vehicle tenant patch party equal must scrub solve tower estate able spawn';
  const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
  const creatorAddr = creatorAccount.addr;
  let creatorAccountInfo = await client.accountInformation(creatorAddr).do();
  console.log(
    'Creator Account address: ',
    creatorAddr,
    '\nCreator Account balance: ',
    creatorAccountInfo['amount']
  );

  const traderMnemonic =
    'pattern setup bacon drop young cupboard easy session north slim blouse ostrich visual orphan step once middle just scissors cave lady slide setup able rib';
  const traderAccount = algosdk.mnemonicToSecretKey(traderMnemonic);
  const traderAddr = traderAccount.addr;
  let traderAccountInfo = await client.accountInformation(traderAddr).do();
  console.log(
    'Trader Account address: ',
    traderAddr,
    '\nTrader Account balance: ',
    traderAccountInfo['amount']
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
