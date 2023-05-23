import { Injectable } from '@angular/core';
import algosdk from 'algosdk';
import { to_msgpack } from 'src/app/schema/msgpack';
import { EnclaveService } from 'src/app/services/enclave.service';
import {
  createBuyDRTTxn,
  createClaimContributorTxn,
  createClaimDRTTxn,
  createCreateDRTTxn,
  createDelistDRTTxn,
  createJoinPoolPendingTxn,
  createlistDRTTxn,
  createRedeemDRTTxn
} from '../../createTransactions/dataPoolOperationTxns';
import { createAssetOptinTxn } from '../../createTransactions/utilityTxns';
import {
  sendBuyDRTTxn,
  sendClaimContributorTxn,
  sendClaimDRTTxn,
  sendCreateDRTTxn,
  sendDelistDRTTxn,
  sendExecuteDRTTxn,
  sendJoinPoolPendingTxn,
  sendListDRTTxn
} from '../../sendTransactions/sendDataPoolTxns';
import { sendAssetOptinTxn } from '../../sendTransactions/sendUtilityTxns';

/**
 * This service handles all transactions related to the communcating with the data pool on algorands network
 */
@Injectable({
  providedIn: 'root'
})
export class PoolOperations {
  constructor(private enclaveService: EnclaveService) {}

  createDRTMethod = async (
    // creatorAccount: algosdk.Account,
    creatorAddr: algosdk.Account['addr'],
    appID: number | bigint,
    client: algosdk.Algodv2,
    drtName: string,
    drtSupply: number | bigint,
    drtPrice: number | bigint,
    drtUrlBinary: string,
    drtBinaryHash: string,
    vault_id: string,
    auth_password: string
  ) => {
    try {
      /// Transaction 1 - Create DRT
      let txn1 = await createCreateDRTTxn(
        appID,
        client,
        creatorAddr,
        drtName,
        drtSupply,
        drtPrice,
        drtUrlBinary,
        drtBinaryHash
      );

      const txId_1 = await txn1?.txID().toString();

      let transaction = {
        AlgorandTransaction: {
          transaction_bytes: new Uint8Array(to_msgpack(txn1))
        }
      };

      const transactionToSign = {
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: transaction
      };

      const signedtxn1 = await this.enclaveService.signTransaction(
        transactionToSign
      );

      const drtID = await sendCreateDRTTxn(signedtxn1, client, txId_1!, appID);

      // Transaction 2 - Claim DRT
      const txn2 = await createClaimDRTTxn(appID, client, creatorAddr, drtID);
      const txId_2 = await txn2?.txID().toString();

      let transaction2 = {
        AlgorandTransaction: {
          transaction_bytes: new Uint8Array(to_msgpack(txn2))
        }
      };

      const transactionToSign2 = {
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: transaction2
      };

      const signedtxn2 = await this.enclaveService.signTransaction(
        transactionToSign2
      );

      const result = await sendClaimDRTTxn(signedtxn2, client, txId_2!);
      return drtID;
    } catch (err) {
      console.log(err);
    }
  };

  buyDRTMethod = async (
    client: algosdk.Algodv2,
    appID: number | bigint,
    buyerAccount: algosdk.Account,
    buyerAddr: algosdk.Account['addr'],
    drtId: number,
    amountToBuy: number,
    paymentAmount: number
  ) => {
    try {
      /// Transaction 1 - Optin to DRT if not already
      // const hasOptedIn = client.accountAssetInformation(buyerAccount.addr, drtId);
      // console.log(hasOptedIn);
      let txn1 = await createAssetOptinTxn(drtId, buyerAddr, client);

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
        buyerAddr,
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

  delistDRTMethod = async (
    client: algosdk.Algodv2,
    appID: number | bigint,
    creatorAccount: algosdk.Account,
    creatorAddr: algosdk.Account['addr'],
    drtId: number
  ) => {
    try {
      let txn1 = await createDelistDRTTxn(appID, client, creatorAddr, drtId);
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

  listDRTMethod = async (
    client: algosdk.Algodv2,
    appID: number | bigint,
    creatorAccount: algosdk.Account,
    creatorAddr: algosdk.Account['addr'],
    drtId: number
  ) => {
    try {
      let txn1 = await createlistDRTTxn(appID, client, creatorAddr, drtId);
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

  joinPoolPendingMethod = async (
    client: algosdk.Algodv2,
    contributorAccount: algosdk.Account,
    contributorAddr: algosdk.Account['addr'],
    appID: number | bigint,
    appendId: number,
    assetAmount: number,
    assetFee: number,
    executionFee: number
  ) => {
    try {
      //invoke buy method for the append DRT
      const buyAppendDRT = await this.buyDRTMethod(
        client,
        appID,
        contributorAccount,
        contributorAddr,
        appendId,
        assetAmount,
        assetFee
      );

      let txn = await createJoinPoolPendingTxn(
        client,
        appID,
        contributorAddr,
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
      const signedtxn3 =
        txn?.addPendingContributorTxn.signTxn(contributorSecret);
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

  claimContributorMethod = async (
    client: algosdk.Algodv2,
    appID: number | bigint,
    contributorAccount: algosdk.Account,
    contributorAddr: algosdk.Account['addr'],
    contributorAssetId: number
  ) => {
    try {
      /// Transaction 1 - Optin to contributor token if not already
      let txnOpt = await createAssetOptinTxn(
        contributorAssetId,
        contributorAddr,
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
        contributorAddr,
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

  // Execute DRT
  redeemDRTMethod = async (
    client: algosdk.Algodv2,
    redeemerAccount: algosdk.Account,
    redeemerAddr: algosdk.Account['addr'],
    appID: number | bigint,
    assetId: number,
    assetAmount: number,
    executionFee: number
  ) => {
    try {
      let txn = await createRedeemDRTTxn(
        client,
        appID,
        redeemerAddr,
        assetId,
        assetAmount,
        executionFee
      );

      const txId_1 = await txn?.assetTransferTxn?.txID().toString();
      const txId_2 = await txn?.payTxn?.txID().toString();
      const txId_3 = await txn?.executeDRTTxn.txID().toString();

      // // Sign the transaction, here we have to intervene
      const contributorSecret = redeemerAccount?.sk;

      const signedtxn1 = txn?.assetTransferTxn?.signTxn(contributorSecret);
      const signedtxn2 = txn?.payTxn?.signTxn(contributorSecret);
      const signedtxn3 = txn?.executeDRTTxn.signTxn(contributorSecret);
      // // pai(username, password, signedTxn)
      // // intervene above with authenticateion

      // send group transaction
      const result = await sendExecuteDRTTxn(
        [signedtxn1, signedtxn2, signedtxn3],
        client,
        txId_3!
      );
      return result;
    } catch (err) {
      console.log(err);
    }
  };
}
