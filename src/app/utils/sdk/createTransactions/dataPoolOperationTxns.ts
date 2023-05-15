import algosdk, { assignGroupID } from 'algosdk';
import { createAssetTransferTxn, createPaymentTxn } from './utilityTxns';

// create unsigned transaction DEMO until the enclave can create their own transactions
export const createCreateDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creator: { addr: string },
  drtName: string,
  drtSupply: number | bigint,
  drtPrice: number | bigint,
  drtUrlBinary: string,
  drtBinaryHash: string
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);
    const appArgs = [
      new Uint8Array(Buffer.from('create_drt')),
      new Uint8Array(Buffer.from(drtName)),
      new Uint8Array(Buffer.from(algosdk.encodeUint64(drtSupply))),
      new Uint8Array(Buffer.from(drtUrlBinary)),
      new Uint8Array(Buffer.from(drtBinaryHash)),
      new Uint8Array(Buffer.from(algosdk.encodeUint64(drtPrice)))
    ];
    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creator.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      accounts: [creator.addr]
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};

export const createClaimDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creator: { addr: string },
  drtID: number | bigint
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);
    const appArgs = [new Uint8Array(Buffer.from('drt_to_box'))];
    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const assetBytes = algosdk.encodeUint64(drtID);
    const pk = algosdk.decodeAddress(contractAddr).publicKey;
    var boxName = new Uint8Array(assetBytes.length + pk.length);
    boxName.set(assetBytes);
    boxName.set(pk, assetBytes.length);

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creator.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(drtID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: boxName
        }
      ]
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};

export const createBuyDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  buyer: { addr: string },
  drtID: number | bigint,
  amountToBuy: number | bigint,
  paymentAmount: number | bigint
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const assetBytes = algosdk.encodeUint64(drtID);
    const pkContract = algosdk.decodeAddress(contractAddr).publicKey;
    var boxNameExisting = new Uint8Array(assetBytes.length + pkContract.length);
    boxNameExisting.set(assetBytes);
    boxNameExisting.set(pkContract, assetBytes.length);

    const pkBuyer = algosdk.decodeAddress(buyer.addr).publicKey;
    var boxNameNew = new Uint8Array(assetBytes.length + pkBuyer.length);
    boxNameNew.set(assetBytes);
    boxNameNew.set(pkBuyer, assetBytes.length);

    const appArgs = [
      new Uint8Array(Buffer.from('buy_drt')),
      new Uint8Array(Buffer.from(algosdk.encodeUint64(amountToBuy)))
    ];

    const buyTxn = algosdk.makeApplicationCallTxnFromObject({
      from: buyer.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(drtID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: boxNameExisting
        },
        {
          appIndex: Number(appID),
          name: boxNameNew
        }
      ]
    });

    const payTxn = await createPaymentTxn(
      buyer.addr,
      paymentAmount,
      contractAddr,
      client
    );

    assignGroupID([buyTxn, payTxn!]);

    return { buyTxn, payTxn };
  } catch (err) {
    console.log(err);
  }
};

export const createDelistDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creator: { addr: string },
  drtID: number | bigint
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const assetBytes = algosdk.encodeUint64(drtID);
    const pkContract = algosdk.decodeAddress(contractAddr).publicKey;
    var boxName = new Uint8Array(assetBytes.length + pkContract.length);
    boxName.set(assetBytes);
    boxName.set(pkContract, assetBytes.length);

    const appArgs = [new Uint8Array(Buffer.from('de_list_drt'))];

    const delistTxn = algosdk.makeApplicationCallTxnFromObject({
      from: creator.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(drtID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: boxName
        }
      ]
    });

    return delistTxn;
  } catch (err) {
    console.log(err);
  }
};

export const createlistDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creator: { addr: string },
  drtID: number | bigint
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const assetBytes = algosdk.encodeUint64(drtID);
    const pkContract = algosdk.decodeAddress(contractAddr).publicKey;
    var boxName = new Uint8Array(assetBytes.length + pkContract.length);
    boxName.set(assetBytes);
    boxName.set(pkContract, assetBytes.length);

    const appArgs = [new Uint8Array(Buffer.from('list_drt'))];

    const listTxn = algosdk.makeApplicationCallTxnFromObject({
      from: creator.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(drtID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: boxName
        }
      ]
    });

    return listTxn;
  } catch (err) {
    console.log(err);
  }
};

export const createJoinPoolPendingTxn = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  contributor: { addr: string },
  appendID: number | bigint,
  assetAmount: number | bigint,
  executionFee: number | bigint
) => {
  try {
    // Transaction 1 - asset transfer
    const contractAddr = algosdk.getApplicationAddress(appID);

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const assetTransferTxn = await createAssetTransferTxn(
      client,
      contributor.addr,
      contractAddr,
      appendID,
      assetAmount
    );

    // Transaction 2 - payment transaction
    const payTxn = await createPaymentTxn(
      contributor.addr,
      executionFee,
      contractAddr,
      client
    );

    // Transaction 3 - add user as pending contributor
    const appArgs = [new Uint8Array(Buffer.from('add_contributor_pending'))];
    const boxName = algosdk.decodeAddress(contributor.addr).publicKey;

    const addPendingContributorTxn = algosdk.makeApplicationCallTxnFromObject({
      from: contributor.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      boxes: [
        {
          appIndex: Number(appID),
          name: boxName
        }
      ]
    });

    assignGroupID([assetTransferTxn!, payTxn!, addPendingContributorTxn]);

    return { assetTransferTxn, payTxn, addPendingContributorTxn };
  } catch (err) {
    console.log(err);
  }
};

// create unsigned transaction DEMO until the enclave can create their own transactions
export const createClaimContributorTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  contributorAccount: { addr: string },
  contributorAssetID: number
) => {
  try {
    const appArgs = [new Uint8Array(Buffer.from('add_contributor_claim'))];

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: contributorAccount.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(contributorAssetID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: new Uint8Array(
            Buffer.from(algosdk.encodeUint64(contributorAssetID))
          )
        },
        {
          appIndex: Number(appID),
          name: algosdk.decodeAddress(contributorAccount.addr).publicKey
        }
      ]
    });
    return txn;
  } catch (err) {
    console.log(err);
  }
};

export const createRedeemDRTTxn = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  redeemer: { addr: string },
  drtId: number | bigint,
  assetAmount: number | bigint,
  executionFee: number | bigint
) => {
  try {
    // Transaction 1 - asset transfer
    const contractAddr = algosdk.getApplicationAddress(appID);

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const assetTransferTxn = await createAssetTransferTxn(
      client,
      redeemer.addr,
      contractAddr,
      drtId,
      assetAmount
    );

    // Transaction 2 - payment transaction
    const payTxn = await createPaymentTxn(
      redeemer.addr,
      executionFee,
      contractAddr,
      client
    );

    // Transaction 3 - execute DRT instruction
    const appArgs = [new Uint8Array(Buffer.from('execute_drt'))];

    const assetBytes = algosdk.encodeUint64(drtId);
    const pkContract = algosdk.decodeAddress(contractAddr).publicKey;
    var boxNameApp = new Uint8Array(assetBytes.length + pkContract.length);
    boxNameApp.set(assetBytes);
    boxNameApp.set(pkContract, assetBytes.length);

    const pkRedeemer = algosdk.decodeAddress(redeemer.addr).publicKey;
    var boxNameOwner = new Uint8Array(assetBytes.length + pkRedeemer.length);
    boxNameOwner.set(assetBytes);
    boxNameOwner.set(pkRedeemer, assetBytes.length);

    const executeDRTTxn = algosdk.makeApplicationCallTxnFromObject({
      from: redeemer.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(drtId)],
      boxes: [
        {
          appIndex: Number(appID),
          name: boxNameOwner
        },
        {
          appIndex: Number(appID),
          name: boxNameApp
        }
      ]
    });

    assignGroupID([assetTransferTxn!, payTxn!, executeDRTTxn]);

    return { assetTransferTxn, payTxn, executeDRTTxn };
  } catch (err) {
    console.log(err);
  }
};
