import algosdk from 'algosdk';
import * as base64js from 'base64-js';

// compile Program
export const compileContract = async (
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

// create unsigned transaction to deploy teal code
export const createDeployContractTxn = async (
  creatorAddr: algosdk.Account['addr'],
  enclaveAddr: algosdk.Account['addr'],
  nautilusAddr: algosdk.Account['addr'],
  client: algosdk.Algodv2,
  approvalProgram: string | undefined,
  clearProgram: string | undefined
) => {
  try {
    // declare application state storage (immutable)
    const localInts = 0;
    const localBytes = 0;
    const globalInts = 10;
    const globalBytes = 5;

    const appArgs: never[] = [];

    const params = await client.getTransactionParams().do();

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
      accounts: [enclaveAddr, nautilusAddr],
      extraPages: extraPagesNo
    });

    const modifiedTransaction = {
      ...txn,
      apl: txn!.type,
      snd: txn?.from.publicKey,
      apgs: { nui: txn?.appGlobalInts, nbs: txn?.appGlobalByteSlices },
      apap: txn?.appApprovalProgram,
      apsu: txn?.appClearProgram,
      apat: [txn!.appAccounts![0].publicKey, txn!.appAccounts![1].publicKey],
      apep: txn!.extraPages,
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txn, txnID };
  } catch (err) {
    console.log(err);
  }
};

// create unsigned transaction to fund smart contract
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
    return { modifiedTransaction, txn, txnID };
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
          name: algosdk.encodeUint64(contributorAssetID)
        },
        {
          appIndex: Number(appID),
          name: algosdk.decodeAddress(creatorAddr).publicKey
        },
        {
          appIndex: Number(appID),
          name: boxName
        }
      ]
    });

    // never change this
    // the i field must be left at 0, the zero i (appIndex) indicates that the
    // application call is references boxes that are stored in the current application.
    // only necessary to change this field you want the current application to call a foreign box from another application.
    // Then to do so, you need to include the foreign application ID in the foreignApps array of the transaction to.
    // As well as the i field of the box. i.e. i: Number(ForeignAppID) ..
    const apbx = [
      {
        i: 0,
        n: txn.boxes![0].name
      },
      {
        i: 0,
        n: txn.boxes![1].name
      },
      {
        i: 0,
        n: txn.boxes![2].name
      }
    ];

    // Create modified transaction to get processed by Algonaut SDK in enclave.
    var modifiedTransaction = {
      ...txn,
      type: txn!.type, //type
      snd: txn?.from.publicKey, //sender
      apid: txn!.appIndex, //app ID
      apaa: [txn!.appArgs![0]], //app arguments
      apas: [txn!.appForeignAssets![0], txn!.appForeignAssets![1]], //foreign ASAs
      apbx: apbx, //boxes
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash,
      fee: txn!.fee
    };

    const txnID = txn!.txID().toString(); //transaction ID

    return { modifiedTransaction, txn, txnID };
  } catch (err) {
    console.log(err);
  }
};
