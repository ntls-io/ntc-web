import algosdk, { assignGroupID } from 'algosdk';
import { createAssetTransferTxn, createPaymentTxn } from './utilityTxns';

export const createCreateDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creatorAddr: algosdk.Account['addr'],
  drtName: string,
  drtSupply: number | bigint,
  drtPrice: number | bigint,
  drtUrlBinary: string,
  drtBinaryHash: string
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const appArgs = [
      encoder.encode('create_drt'),
      encoder.encode(drtName),
      algosdk.encodeUint64(drtSupply),
      encoder.encode(drtUrlBinary),
      encoder.encode(drtBinaryHash),
      algosdk.encodeUint64(drtPrice)
    ];
    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creatorAddr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs
      //accounts: [creatorAddr]
    });
    const modifiedTransaction = {
      ...txn,
      apl: txn!.type,
      snd: txn?.from.publicKey,
      apid: txn!.appIndex, //app ID
      apaa: [
        txn!.appArgs![0],
        txn!.appArgs![1],
        txn!.appArgs![2],
        txn!.appArgs![3],
        txn!.appArgs![4],
        txn!.appArgs![5]
      ], //app args
      //apat: [txn!.appAccounts![0].publicKey], //foreign accounts
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash,
      fee: txn!.fee
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txnID };
  } catch (err) {
    console.log(err);
  }
};

export const createStoreDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creatorAddr: algosdk.Account['addr'],
  drtID: number | bigint
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);
    const encoder = new TextEncoder();
    const appArgs = [encoder.encode('drt_to_box')];
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
      from: creatorAddr,
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
    const apbx = [
      {
        i: 0,
        n: txn.boxes![0].name
      }
    ];
    const modifiedTransaction = {
      ...txn,
      apl: txn!.type,
      snd: txn?.from.publicKey,
      apid: txn!.appIndex, //app ID
      apaa: [txn!.appArgs![0]], //app args
      apas: [txn!.appForeignAssets![0]], //foreign assets
      apbx: apbx, // boxes
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash,
      fee: txn!.fee
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txnID };
  } catch (err) {
    console.log(err);
  }
};

export const createBuyDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  buyerAddr: algosdk.Account['addr'],
  drtID: number | bigint,
  amountToBuy: number | bigint,
  paymentAmount: number | bigint
) => {
  try {
    const encoder = new TextEncoder();

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

    const pkBuyer = algosdk.decodeAddress(buyerAddr).publicKey;
    var boxNameNew = new Uint8Array(assetBytes.length + pkBuyer.length);
    boxNameNew.set(assetBytes);
    boxNameNew.set(pkBuyer, assetBytes.length);

    const appArgs = [
      encoder.encode('buy_drt'),
      algosdk.encodeUint64(amountToBuy)
    ];

    const buyTxn = algosdk.makeApplicationCallTxnFromObject({
      from: buyerAddr,
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
    const apbxBuy = [
      {
        i: 0,
        n: buyTxn.boxes![0].name
      },
      {
        i: 0,
        n: buyTxn.boxes![1].name
      }
    ];

    const payTxn = await createPaymentTxn(
      buyerAddr,
      paymentAmount,
      contractAddr,
      client
    );

    assignGroupID([buyTxn, payTxn!.txn]);

    const modifiedTransactionBuy = {
      ...buyTxn,
      apl: buyTxn!.type,
      snd: buyTxn?.from.publicKey,
      apid: buyTxn!.appIndex, //app ID
      apaa: [buyTxn!.appArgs![0], buyTxn!.appArgs![1]], //app args
      apas: [buyTxn!.appForeignAssets![0]], //foreign assets
      apbx: apbxBuy,
      fv: buyTxn!.firstRound,
      lv: buyTxn!.lastRound,
      gen: buyTxn!.genesisID,
      gh: buyTxn!.genesisHash,
      fee: buyTxn!.fee,
      grp: buyTxn.group
    };

    const modifiedTransactionPay = {
      ...payTxn!.modifiedTransaction,
      grp: payTxn!.txn.group
    };

    const txnID_Buy = buyTxn!.txID().toString();
    const txnID_Pay = payTxn?.txnID;

    return {
      modifiedTransactionBuy,
      txnID_Buy,
      modifiedTransactionPay,
      txnID_Pay
    };
  } catch (err) {
    console.log(err);
  }
};

export const createDelistDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creatorAddr: algosdk.Account['addr'],
  drtID: number | bigint
) => {
  try {
    const encoder = new TextEncoder();
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

    const appArgs = [encoder.encode('de_list_drt')];

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creatorAddr,
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
    const apbx = [
      {
        i: 0,
        n: txn.boxes![0].name
      }
    ];

    const modifiedTransaction = {
      ...txn,
      apl: txn!.type,
      snd: txn?.from.publicKey,
      apid: txn!.appIndex, //app ID
      apaa: [txn!.appArgs![0]], //app args
      apas: [txn!.appForeignAssets![0]], //foreign assets
      apbx: apbx,
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash,
      fee: txn!.fee
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txnID };
  } catch (err) {
    console.log(err);
  }
};

export const createlistDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creatorAddr: algosdk.Account['addr'],
  drtID: number | bigint
) => {
  try {
    const encoder = new TextEncoder();
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

    const appArgs = [encoder.encode('list_drt')];

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creatorAddr,
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
    const apbx = [
      {
        i: 0,
        n: txn.boxes![0].name
      }
    ];

    const modifiedTransaction = {
      ...txn,
      apl: txn!.type,
      snd: txn?.from.publicKey,
      apid: txn!.appIndex, //app ID
      apaa: [txn!.appArgs![0]], //app args
      apas: [txn!.appForeignAssets![0]], //foreign assets
      apbx: apbx,
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash,
      fee: txn!.fee
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txnID };
  } catch (err) {
    console.log(err);
  }
};

export const createJoinPoolPendingTxn = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  contributorAddr: algosdk.Account['addr'],
  appendID: number | bigint,
  assetAmount: number | bigint,
  executionFee: number | bigint
) => {
  try {
    const encoder = new TextEncoder();
    // Transaction 1 - asset transfer
    const contractAddr = algosdk.getApplicationAddress(appID);

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const assetTransferTxn = await createAssetTransferTxn(
      client,
      contributorAddr,
      contractAddr,
      appendID,
      assetAmount
    );

    // Transaction 2 - payment transaction
    const payTxn = await createPaymentTxn(
      contributorAddr,
      executionFee,
      contractAddr,
      client
    );

    // Transaction 3 - add user as pending contributor
    const appArgs = [encoder.encode('add_contributor_pending')];
    const boxName = algosdk.decodeAddress(contributorAddr).publicKey;

    const addPendingContributorTxn = algosdk.makeApplicationCallTxnFromObject({
      from: contributorAddr,
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
    const apbx = [
      {
        i: 0,
        n: addPendingContributorTxn.boxes![0].name
      }
    ];

    //assign groups
    assignGroupID([
      assetTransferTxn!.txn,
      payTxn!.txn,
      addPendingContributorTxn
    ]);

    const modifiedTransaction_assetTransfer = {
      ...assetTransferTxn!.modifiedTransaction,
      grp: assetTransferTxn!.txn.group
    };
    const modifiedTransaction_assetPayment = {
      ...payTxn!.modifiedTransaction,
      grp: payTxn!.txn.group
    };

    const modifiedTransaction_addPending = {
      ...addPendingContributorTxn,
      apl: addPendingContributorTxn!.type,
      snd: addPendingContributorTxn?.from.publicKey,
      apid: addPendingContributorTxn!.appIndex, //app ID
      apaa: [addPendingContributorTxn!.appArgs![0]], //app args
      apbx: apbx,
      fv: addPendingContributorTxn!.firstRound,
      lv: addPendingContributorTxn!.lastRound,
      gen: addPendingContributorTxn!.genesisID,
      gh: addPendingContributorTxn!.genesisHash,
      fee: addPendingContributorTxn!.fee,
      grp: addPendingContributorTxn.group
    };

    const assetTransferTxn_ID = assetTransferTxn!.txn.txID().toString();
    const assetPaymentTxn_ID = payTxn!.txn.txID().toString();
    const addPendingTxn_ID = addPendingContributorTxn!.txID().toString();

    return {
      modifiedTransaction_assetTransfer,
      assetTransferTxn_ID,
      modifiedTransaction_assetPayment,
      assetPaymentTxn_ID,
      modifiedTransaction_addPending,
      addPendingTxn_ID
    };
  } catch (err) {
    console.log(err);
  }
};

// claim contributor token transaction
export const createClaimContributorTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  contributorAddr: algosdk.Account['addr'],
  contributorAssetID: number
) => {
  try {
    const encoder = new TextEncoder();
    const appArgs = [encoder.encode('add_contributor_claim')];

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: contributorAddr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(contributorAssetID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: algosdk.encodeUint64(contributorAssetID)
        },
        {
          appIndex: Number(appID),
          name: algosdk.decodeAddress(contributorAddr).publicKey
        }
      ]
    });

    const apbx = [
      {
        i: 0,
        n: txn.boxes![0].name
      },
      {
        i: 0,
        n: txn.boxes![1].name
      }
    ];

    const modifiedTransaction = {
      ...txn,
      apl: txn!.type,
      snd: txn?.from.publicKey,
      apid: txn!.appIndex, //app ID
      apaa: [txn!.appArgs![0]], //app args
      apas: [txn!.appForeignAssets![0]], //foreign assets
      apbx: apbx,
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash,
      fee: txn!.fee
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txnID };
  } catch (err) {
    console.log(err);
  }
};

export const createRedeemDRTTxn = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  redeemerAddr: algosdk.Account['addr'],
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
      redeemerAddr,
      contractAddr,
      drtId,
      assetAmount
    );

    // Transaction 2 - payment transaction
    const payTxn = await createPaymentTxn(
      redeemerAddr,
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

    const pkRedeemer = algosdk.decodeAddress(redeemerAddr).publicKey;
    var boxNameOwner = new Uint8Array(assetBytes.length + pkRedeemer.length);
    boxNameOwner.set(assetBytes);
    boxNameOwner.set(pkRedeemer, assetBytes.length);

    const executeDRTTxn = algosdk.makeApplicationCallTxnFromObject({
      from: redeemerAddr,
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
    //assign groups
    assignGroupID([assetTransferTxn!.txn, payTxn!.txn, executeDRTTxn]);

    const modifiedTransaction_assetTransfer = {
      ...assetTransferTxn!.txn,
      grp: assetTransferTxn!.txn.group
    };
    const modifiedTransaction_ExecuteFee = {
      ...payTxn!.txn,
      grp: payTxn!.txn.group
    };

    const modifiedTransaction_executeDRTTxn = {
      ...executeDRTTxn,
      apl: executeDRTTxn!.type,
      snd: executeDRTTxn?.from.publicKey,
      apid: executeDRTTxn!.appIndex, //app ID
      apaa: [executeDRTTxn!.appArgs![0]], //app args
      apas: [executeDRTTxn!.appForeignAssets![0]], //foreign assets
      // apbx: [boxes] WIP TODO
      fv: executeDRTTxn!.firstRound,
      lv: executeDRTTxn!.lastRound,
      gen: executeDRTTxn!.genesisID,
      gh: executeDRTTxn!.genesisHash,
      grp: executeDRTTxn.group
    };

    const assetTransferTxn_ID = assetTransferTxn!.txn.txID().toString();
    const ExecuteFeeTxn_ID = payTxn!.txn.txID().toString();
    const execeuteDRTTxn_ID = executeDRTTxn!.txID().toString();

    return {
      modifiedTransaction_assetTransfer,
      assetTransferTxn_ID,
      modifiedTransaction_ExecuteFee,
      ExecuteFeeTxn_ID,
      modifiedTransaction_executeDRTTxn,
      execeuteDRTTxn_ID
    };
  } catch (err) {
    console.log(err);
  }
};

export const createClaimRoyaltiesTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  contributorAddr: algosdk.Account['addr'],
  contributorAssetID: number
) => {
  try {
    const encoder = new TextEncoder();
    const appArgs = [encoder.encode('claim_royalty_contributor')];

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: contributorAddr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(contributorAssetID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: algosdk.encodeUint64(contributorAssetID)
        }
      ]
    });

    const apbx = [
      {
        i: 0,
        n: txn.boxes![0].name
      }
    ];

    const modifiedTransaction = {
      ...txn,
      apl: txn!.type,
      snd: txn?.from.publicKey,
      apid: txn!.appIndex, //app ID
      apaa: [txn!.appArgs![0]], //app args
      apas: [txn!.appForeignAssets![0]], //foreign assets
      apbx: apbx,
      fv: txn!.firstRound,
      lv: txn!.lastRound,
      gen: txn!.genesisID,
      gh: txn!.genesisHash,
      fee: txn!.fee
    };

    const txnID = txn!.txID().toString();
    return { modifiedTransaction, txnID };
  } catch (err) {
    console.log(err);
  }
};
