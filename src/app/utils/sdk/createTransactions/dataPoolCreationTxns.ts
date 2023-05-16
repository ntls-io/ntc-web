import algosdk from 'algosdk';
import * as fs from 'fs';
import * as path from 'path';

// Read Teal File
const readTeal = async () => {
  let approvalProgram = '';
  let clearStateProgram = '';

  try {
    approvalProgram = fs.readFileSync(
      path.resolve(__dirname, '../contract/approval.teal'),
      'utf8'
    );
    clearStateProgram = fs.readFileSync(
      path.resolve(__dirname, '../contract/clear.teal'),
      'utf8'
    );

    return [approvalProgram, clearStateProgram];
    // console.log(approvalProgram);
    // console.log(clearStateProgram);
  } catch (err) {
    console.error(err);
  }
};

// Compile Program
const compileContract = async (
  client: algosdk.Algodv2,
  programSource: string | undefined
) => {
  const encoder = new TextEncoder();
  const programBytes = encoder.encode(programSource);
  const compileResponse = await client.compile(programBytes).do();
  const compiledBytes = new Uint8Array(
    Buffer.from(compileResponse.result, 'base64')
  );
  return compiledBytes;
};

// create unsigned transaction
export const createDeployContractTxn = async (
  creatorAddr: algosdk.Account['addr'],
  enclaveAddr: algosdk.Account['addr'],
  client: algosdk.Algodv2
) => {
  try {
    // declare application state storage (immutable)
    const localInts = 0;
    const localBytes = 0;
    const globalInts = 10; // # 4 for setup + 20 for choices. Use a larger number for more choices.
    const globalBytes = 5;

    const appArgs: never[] = [];

    const params = await client.getTransactionParams().do();
    const program = await readTeal();

    const compiledApprovalProgram = await compileContract(client, program![0]);
    const compiledClearProgram = await compileContract(client, program![1]);

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const extraPagesNo = 2;

    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: creatorAddr,
      suggestedParams: params,
      onComplete: onComplete,
      approvalProgram: compiledApprovalProgram,
      clearProgram: compiledClearProgram,
      numLocalInts: localInts,
      numLocalByteSlices: localBytes,
      numGlobalByteSlices: globalBytes,
      numGlobalInts: globalInts,
      appArgs: appArgs,
      accounts: [enclaveAddr],
      extraPages: extraPagesNo
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};

// create unsigned transaction
export const createFundContractTxn = async (
  appID: number | bigint,
  fundAmount: any,
  accountAddr: algosdk.Account['addr'],
  client: algosdk.Algodv2
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);

    const appArgs = [];

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: accountAddr,
      to: contractAddr,
      amount: fundAmount,
      suggestedParams: params
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};

// create unsigned transaction DEMO until the enclave can create their own transactions
export const DEMO_createSetupDataPoolTxn = async (
  appID: number | bigint,
  account: { addr: any },
  client: algosdk.Algodv2,
  creator: { addr: string },
  noRowsContributed: number | bigint,
  dataPoolHash: string,
  appendDRTName: string,
  appendDRTUnitName: string,
  appendDRTSupply: number | bigint,
  appendDRTPrice: number | bigint,
  appendDRTurlBinary: string,
  appendDRTBinaryHash: string
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);

    const appArgs = [
      new Uint8Array(Buffer.from('init_contract')),
      new Uint8Array(Buffer.from(algosdk.encodeUint64(noRowsContributed))),
      new Uint8Array(Buffer.from(dataPoolHash)),
      new Uint8Array(Buffer.from(appendDRTName)),
      new Uint8Array(Buffer.from(appendDRTUnitName)),
      new Uint8Array(Buffer.from(algosdk.encodeUint64(appendDRTSupply))),
      new Uint8Array(Buffer.from(algosdk.encodeUint64(appendDRTPrice))),
      new Uint8Array(Buffer.from(appendDRTurlBinary)),
      new Uint8Array(Buffer.from(appendDRTBinaryHash))
    ];
    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: account.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      accounts: [creator.addr],
      // foreignApps: [Number(appID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: algosdk.decodeAddress(creator.addr).publicKey
        }
      ]
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};

// create unsigned transaction to claim contributor token during smart contract creation
export const createInitClaimContributorTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creatorAddr: algosdk.Account['addr'],
  contributorAssetID: number,
  appendAssetID: number | bigint
) => {
  try {
    const appArgs = [new Uint8Array(Buffer.from('add_contributor_claim'))];

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const contractAddr = algosdk.getApplicationAddress(appID);
    const assetBytes = algosdk.encodeUint64(appendAssetID);
    const pk = algosdk.decodeAddress(contractAddr).publicKey;
    var boxName = new Uint8Array(assetBytes.length + pk.length);
    boxName.set(assetBytes);
    boxName.set(pk, assetBytes.length);

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creatorAddr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [contributorAssetID, Number(appendAssetID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: new Uint8Array(
            Buffer.from(algosdk.encodeUint64(contributorAssetID))
          )
        },
        {
          appIndex: Number(appID),
          name: boxName
        },
        {
          appIndex: Number(appID),
          name: algosdk.decodeAddress(creatorAddr).publicKey
        }
      ]
    });
    return txn;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createDeployContractTxn,
  createFundContractTxn,
  DEMO_createSetupDataPoolTxn,
  createInitClaimContributorTxn
};
