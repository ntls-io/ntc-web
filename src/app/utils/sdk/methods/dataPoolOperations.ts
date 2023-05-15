import algosdk from 'algosdk';

import {
  createBuyDRTTxn,
  createClaimContributorTxn,
  createClaimDRTTxn,
  createCreateDRTTxn,
  createDelistDRTTxn,
  createJoinPoolPendingTxn,
  createlistDRTTxn
} from '../createTransactions/dataPoolOperationTxns';
import { createAssetOptinTxn } from '../createTransactions/utilityTxns';
import {
  sendBuyDRTTxn,
  sendClaimContributorTxn,
  sendClaimDRTTxn,
  sendCreateDRTTxn,
  sendDelistDRTTxn,
  sendJoinPoolPendingTxn,
  sendListDRTTxn
} from '../sendTransactions/sendDataPoolTxns';
import { sendAssetOptinTxn } from '../sendTransactions/sendUtilityTxns';

const createDRTMethod = async (
  creatorAccount: algosdk.Account,
  appID: number | bigint,
  client: algosdk.Algodv2,
  drtName: string,
  drtSupply: number | bigint,
  drtPrice: number | bigint,
  drtUrlBinary: string,
  drtBinaryHash: string
) => {
  try {
    /// Transaction 1 - Create DRT
    let txn1 = await createCreateDRTTxn(
      appID,
      client,
      creatorAccount,
      drtName,
      drtSupply,
      drtPrice,
      drtUrlBinary,
      drtBinaryHash
    );

    const txId_1 = await txn1?.txID().toString();

    // Sign the transaction, here we have to intervene
    const creatorSecret = creatorAccount?.sk;
    const signedtxn1 = txn1?.signTxn(creatorSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const drtID = await sendCreateDRTTxn(signedtxn1, client, txId_1!, appID);
    const txn2 = await createClaimDRTTxn(appID, client, creatorAccount, drtID);
    const txId_2 = await txn2?.txID().toString();

    // Sign the transaction, here we have to intervene
    const signedtxn2 = txn2?.signTxn(creatorSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const result = await sendClaimDRTTxn(signedtxn2, client, txId_2!);
    return drtID;
  } catch (err) {
    console.log(err);
  }
};

const buyDRTMethod = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  buyerAccount: algosdk.Account,
  drtId: number,
  amountToBuy: number,
  paymentAmount: number
) => {
  try {
    /// Transaction 1 - Optin to DRT if not already
    // const hasOptedIn = client.accountAssetInformation(buyerAccount.addr, drtId);
    // console.log(hasOptedIn);
    let txn1 = await createAssetOptinTxn(drtId, buyerAccount, client);

    const txId_1 = await txn1?.txID().toString();

    // Sign the transaction, here we have to intervene
    const buyerSecret = buyerAccount?.sk;
    const signedtxn1 = txn1?.signTxn(buyerSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const optin = await sendAssetOptinTxn(signedtxn1, client, txId_1!);

    // /// Transaction 2 - Buy DRT group transaction
    const txn2 = await createBuyDRTTxn(
      appID,
      client,
      buyerAccount,
      drtId,
      amountToBuy,
      paymentAmount
    );
    const txId_2 = await txn2?.buyTxn.txID().toString();
    const txId_3 = await txn2?.payTxn?.txID().toString();

    // // Sign the transaction, here we have to intervene
    const signedtxn2 = txn2?.buyTxn.signTxn(buyerSecret);
    const signedtxn3 = txn2?.payTxn?.signTxn(buyerSecret);
    // // pai(username, password, signedTxn)
    // // intervene above with authenticateion

    // send group transaction
    const result = await sendBuyDRTTxn(
      [signedtxn2, signedtxn3],
      client,
      txId_2!
    );
    // console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
};

const delistDRTMethod = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  creatorAccount: algosdk.Account,
  drtId: number
) => {
  try {
    let txn1 = await createDelistDRTTxn(appID, client, creatorAccount, drtId);
    const txId_1 = await txn1?.txID().toString();

    // Sign the transaction, here we have to intervene
    const buyerSecret = creatorAccount?.sk;
    const signedtxn1 = txn1?.signTxn(buyerSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const result = await sendDelistDRTTxn(signedtxn1, client, txId_1!);

    return result;
  } catch (err) {
    console.log(err);
  }
};

const listDRTMethod = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  creatorAccount: algosdk.Account,
  drtId: number
) => {
  try {
    let txn1 = await createlistDRTTxn(appID, client, creatorAccount, drtId);
    const txId_1 = await txn1?.txID().toString();

    // Sign the transaction, here we have to intervene
    const creatorSecret = creatorAccount?.sk;
    const signedtxn1 = txn1?.signTxn(creatorSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const result = await sendListDRTTxn(signedtxn1, client, txId_1!);

    return result;
  } catch (err) {
    console.log(err);
  }
};

const joinPoolPendingMethod = async (
  client: algosdk.Algodv2,
  contributorAccount: algosdk.Account,
  appID: number | bigint,
  appendId: number,
  assetAmount: number,
  assetFee: number,
  executionFee: number
) => {
  try {
    //invoke buy method for the append DRT
    const buyAppendDRT = await buyDRTMethod(
      client,
      appID,
      contributorAccount,
      appendId,
      assetAmount,
      assetFee
    );

    let txn = await createJoinPoolPendingTxn(
      client,
      appID,
      contributorAccount,
      appendId,
      assetAmount,
      executionFee
    );

    const txId_1 = await txn?.assetTransferTxn?.txID().toString();
    const txId_2 = await txn?.payTxn?.txID().toString();
    const txId_3 = await txn?.addPendingContributorTxn.txID().toString();

    // // Sign the transaction, here we have to intervene
    const contributorSecret = contributorAccount?.sk;

    const signedtxn1 = txn?.assetTransferTxn?.signTxn(contributorSecret);
    const signedtxn2 = txn?.payTxn?.signTxn(contributorSecret);
    const signedtxn3 = txn?.addPendingContributorTxn.signTxn(contributorSecret);
    // // pai(username, password, signedTxn)
    // // intervene above with authenticateion

    // send group transaction
    const result = await sendJoinPoolPendingTxn(
      [signedtxn1, signedtxn2, signedtxn3],
      client,
      txId_3!
    );
    return result;
  } catch (err) {
    console.log(err);
  }
};

const claimContributorMethod = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  contributorAccount: algosdk.Account,
  contributorAssetId: number
) => {
  try {
    /// Transaction 1 - Optin to contributor token if not already
    let txnOpt = await createAssetOptinTxn(
      contributorAssetId,
      contributorAccount,
      client
    );

    const txId_Opt = await txnOpt?.txID().toString();

    // Sign the transaction, here we have to intervene
    const contributorSecret = contributorAccount?.sk;
    const signedtxnOpt = txnOpt?.signTxn(contributorSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const optin = await sendAssetOptinTxn(signedtxnOpt, client, txId_Opt!);

    let txn1 = await createClaimContributorTxn(
      appID,
      client,
      contributorAccount,
      contributorAssetId
    );
    const txId_1 = await txn1?.txID().toString();

    // Sign the transaction, here we have to intervene
    const signedtxn1 = txn1?.signTxn(contributorSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const result = await sendClaimContributorTxn(signedtxn1, client, txId_1!);

    return result;
  } catch (err) {
    console.log(err);
  }
};

export {
  createDRTMethod,
  buyDRTMethod,
  delistDRTMethod,
  listDRTMethod,
  joinPoolPendingMethod,
  claimContributorMethod
};
