import algosdk, { getApplicationAddress } from 'algosdk';
import { createDataPoolMethod } from '../src/app/utils/sdk/methods/createPool';

test('Testnet: Smart Contract Creation ', async () => {
  // setup client to testnet
  const baseServer = 'https://testnet-algorand.api.purestake.io/ps2';
  const port = '';
  const token = {
    'X-API-Key': 'J7eo2jPb5m4OiBneIV6r0ajgRLeSaHqk3QplGETk'
  };
  // const algodToken =
  //   'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  // const baseServer = 'http://localhost';
  // const port = '4001';
  // const client = new algosdk.Algodv2(algodToken, baseServer, port);

  const client = new algosdk.Algodv2(token, baseServer, port);

  // Import Testnet Accounts
  const enclaveMnemonic =
    'design spell baby about story afraid innocent birth coffee vicious include stage beyond price remind before abstract enjoy sign miss improve side duty able crime';
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
    'pool soup shaft gym will rely imitate clown canal embrace dirt repeat number item secret wing good syrup finish height provide hurdle term about setup';
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
    'license slush evil alone capable smile seven reform step goose equip pudding evoke erosion please kidney loan hammer very life pulse bullet motion about stadium';
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

  // create data pool method
  let dataPool = await createDataPoolMethod(
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
}, 300000);
