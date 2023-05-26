import algosdk, { BoxReference } from 'algosdk';
import * as base64js from 'base64-js';

// Compile Program
const compileContract = async (
  client: algosdk.Algodv2,
  programSource: string | undefined
) => {
  const encoder = new TextEncoder();
  const programBytes = encoder.encode(programSource);
  const compileResponse = await client.compile(programBytes).do();
  const compiledBytes = new Uint8Array(
    base64js.toByteArray(compileResponse.result)
  );

  return compiledBytes;
};

// create unsigned transaction
export const createDeployContractTxn = async (
  creatorAddr: algosdk.Account['addr'],
  enclaveAddr: algosdk.Account['addr'],
  client: algosdk.Algodv2,
  approvalProgram: string | undefined,
  clearProgram: string | undefined
) => {
  try {
    // declare application state storage (immutable)
    const localInts = 0;
    const localBytes = 0;
    const globalInts = 10; //
    const globalBytes = 5;

    const appArgs: never[] = [];

    const params = await client.getTransactionParams().do();
    //const program = await readTeal();

    const compiledApprovalProgram = await compileContract(
      client,
      approvalProgram
    );
    const compiledClearProgram = await compileContract(client, clearProgram);

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

    const modifiedTransaction = {
      ...txn,
      apl: txn!.type,
      snd: txn?.from.publicKey,
      apgs: { nui: txn?.appGlobalInts, nbs: txn?.appGlobalByteSlices },
      apap: txn?.appApprovalProgram,
      apsu: txn?.appClearProgram,
      apat: [txn!.appAccounts![0].publicKey],
      apep: txn!.extraPages,
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txnID };
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

    const modifiedTransaction = {
      ...txn,
      apl: txn!.type, // type
      snd: txn!.from.publicKey, // sender
      rcv: txn!.to.publicKey, // receiver,
      amt: txn!.amount, // amount
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txnID };
  } catch (err) {
    console.log(err);
  }
};

// create unsigned transaction DEMO until the enclave can create their own transactions
export const DEMO_createSetupDataPoolTxn = async (
  appID: number | bigint,
  account: { addr: any },
  client: algosdk.Algodv2,
  creatorAddr: string,
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

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const appArgs = [
      encoder.encode('init_contract'),
      algosdk.encodeUint64(noRowsContributed),
      encoder.encode(dataPoolHash),
      encoder.encode(appendDRTName),
      encoder.encode(appendDRTUnitName),
      algosdk.encodeUint64(appendDRTSupply),
      algosdk.encodeUint64(appendDRTPrice),
      encoder.encode(appendDRTurlBinary),
      encoder.encode(appendDRTBinaryHash)
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
      accounts: [creatorAddr],
      boxes: [
        {
          appIndex: Number(appID),
          name: algosdk.decodeAddress(creatorAddr).publicKey
        }
      ]
    });
    console.log(Number(appID));
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
    const encoder = new TextEncoder();
    const appArgs = [encoder.encode('add_contributor_claim')];

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

    const boxReferences: BoxReference[] = [
      { appIndex: Number(appID), name: new Uint8Array([1, 2, 3, 4]) },
      { appIndex: Number(appID), name: new Uint8Array([5, 6, 7, 8]) }
    ];

    // // Create the application call transaction object
    // const txn = algosdk.makeApplicationCallTxnFromObject({
    //   from: creatorAddr,
    //   suggestedParams: params,
    //   appIndex: Number(appID),
    //   onComplete: algosdk.OnApplicationComplete.NoOpOC,
    //   appArgs: appArgs,
    //   boxes: boxReferences
    // });
    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creatorAddr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [contributorAssetID, Number(appendAssetID)],
      boxes: boxReferences
    });

    const apbx = [];
    apbx.push({
      i: Number(appID),
      n: algosdk.encodeUint64(contributorAssetID)
    });
    apbx.push({ i: Number(appID), n: boxName });
    apbx.push({
      i: Number(appID),
      n: algosdk.decodeAddress(creatorAddr).publicKey
    });

    // Create the apbx field with the box references
    var modifiedTransaction = {
      ...txn,
      apl: txn!.type, //type
      snd: txn?.from.publicKey, //sender
      apid: txn!.appIndex, //app ID
      apaa: [txn!.appArgs![0]], //app args
      apas: [txn!.appForeignAssets![0], txn!.appForeignAssets![1]],
      apbx: [algosdk.decodeAddress(creatorAddr).publicKey],
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash
    };

    console.log(modifiedTransaction);
    const txnID = txn!.txID().toString();

    return { modifiedTransaction, txnID };
  } catch (err) {
    console.log(err);
  }
};
