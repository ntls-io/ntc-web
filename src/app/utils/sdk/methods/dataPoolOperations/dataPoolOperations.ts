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
import { createAssetOptinTxn_new } from '../../createTransactions/utilityTxns';
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

      const signedtxn1 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn1?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn1_2;
      if (
        'Signed' in signedtxn1 &&
        'AlgorandTransactionSigned' in signedtxn1.Signed
      ) {
        signedtxn1_2 =
          signedtxn1.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Create DRT 1 Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const drtID = await sendCreateDRTTxn(
        signedtxn1,
        client,
        txn1!.txnID,
        appID
      );

      // Transaction 2 - Claim DRT
      const txn2 = await createClaimDRTTxn(appID, client, creatorAddr, drtID);
      const signedtxn2 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn2?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn2_2;
      if (
        'Signed' in signedtxn2 &&
        'AlgorandTransactionSigned' in signedtxn2.Signed
      ) {
        signedtxn2_2 =
          signedtxn2.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Claim DRT 2 Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const result = await sendClaimDRTTxn(signedtxn2_2, client, txn2!.txnID);
      return drtID;
    } catch (err) {
      console.log(err);
    }
  };

  buyDRTMethod = async (
    client: algosdk.Algodv2,
    appID: number | bigint,
    //buyerAccount: algosdk.Account,
    buyerAddr: algosdk.Account['addr'],
    drtId: number,
    amountToBuy: number,
    paymentAmount: number,
    vault_id: string,
    auth_password: string
  ) => {
    try {
      // transaction 1 - Optin to drt
      const txn1 = await createAssetOptinTxn_new(drtId, buyerAddr, client);

      // sign transaction
      const signedtxn1 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn1?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn1_2;
      if (
        'Signed' in signedtxn1 &&
        'AlgorandTransactionSigned' in signedtxn1.Signed
      ) {
        signedtxn1_2 =
          signedtxn1.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Asset Optin Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      const txn1Result = await sendAssetOptinTxn(
        signedtxn1_2,
        client,
        txn1?.txnID!
      );

      // /// Transaction 2 - Buy DRT group transaction
      const txn2 = await createBuyDRTTxn(
        appID,
        client,
        buyerAddr,
        drtId,
        amountToBuy,
        paymentAmount
      );
      // sign transaction buy 1
      const signedtxn2_buy = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn2?.modifiedTransactionBuy)
            ]) // Add "TX" prefix tag
          }
        }
      });
      // sign transaction buy 2
      const signedtxn2_pay = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn2?.modifiedTransactionPay)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn2_buy_2;
      if (
        'Signed' in signedtxn2_buy &&
        'AlgorandTransactionSigned' in signedtxn2_buy.Signed
      ) {
        signedtxn2_buy_2 =
          signedtxn2_buy.Signed.AlgorandTransactionSigned
            .signed_transaction_bytes;
      } else {
        throw new Error(
          '[Buy Txn 1] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      let signedtxn2_pay_2;
      if (
        'Signed' in signedtxn2_pay &&
        'AlgorandTransactionSigned' in signedtxn2_pay.Signed
      ) {
        signedtxn2_pay_2 =
          signedtxn2_pay.Signed.AlgorandTransactionSigned
            .signed_transaction_bytes;
      } else {
        throw new Error(
          '[Buy Txn 2] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      // send group transaction
      const result = await sendBuyDRTTxn(
        [signedtxn2_buy_2, signedtxn2_pay_2],
        client,
        txn2?.txnID_Pay!
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
    //creatorAccount: algosdk.Account,
    creatorAddr: algosdk.Account['addr'],
    drtId: number,
    vault_id: string,
    auth_password: string
  ) => {
    try {
      let txn1 = await createDelistDRTTxn(appID, client, creatorAddr, drtId);
      const signedtxn1 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn1?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn1_2;
      if (
        'Signed' in signedtxn1 &&
        'AlgorandTransactionSigned' in signedtxn1.Signed
      ) {
        signedtxn1_2 =
          signedtxn1.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[De-list DRT 1 Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const result = await sendDelistDRTTxn(signedtxn1_2, client, txn1?.txnID!);

      return result;
    } catch (err) {
      console.log(err);
    }
  };

  listDRTMethod = async (
    client: algosdk.Algodv2,
    appID: number | bigint,
    //creatorAccount: algosdk.Account,
    creatorAddr: algosdk.Account['addr'],
    drtId: number,
    vault_id: string,
    auth_password: string
  ) => {
    try {
      let txn1 = await createlistDRTTxn(appID, client, creatorAddr, drtId);
      const signedtxn1 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn1?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn1_2;
      if (
        'Signed' in signedtxn1 &&
        'AlgorandTransactionSigned' in signedtxn1.Signed
      ) {
        signedtxn1_2 =
          signedtxn1.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[De-list DRT 1 Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const result = await sendListDRTTxn(signedtxn1_2, client, txn1!.txnID);

      return result;
    } catch (err) {
      console.log(err);
    }
  };

  joinPoolPendingMethod = async (
    client: algosdk.Algodv2,
    //contributorAccount: algosdk.Account,
    contributorAddr: algosdk.Account['addr'],
    appID: number | bigint,
    appendId: number,
    assetAmount: number,
    assetFee: number,
    executionFee: number,
    vault_id: string,
    auth_password: string
  ) => {
    try {
      //invoke buy method for the append DRT
      const buyAppendDRT = await this.buyDRTMethod(
        client,
        appID,
        //buyerAccount: algosdk.Account,
        contributorAddr,
        appendId,
        assetAmount,
        assetFee,
        vault_id,
        auth_password
      );

      let txn2 = await createJoinPoolPendingTxn(
        client,
        appID,
        contributorAddr,
        appendId,
        assetAmount,
        executionFee
      );

      // sign transaction join pool pending 1
      const signedtxn1_pending = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn2?.modifiedTransaction_assetTransfer)
            ]) // Add "TX" prefix tag
          }
        }
      });
      // sign transaction buy 2
      const signedtxn2_pending = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn2?.modifiedTransaction_assetPayment)
            ]) // Add "TX" prefix tag
          }
        }
      });
      const signedtxn3_pending = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn2?.modifiedTransaction_addPending)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn1_pending_2;
      if (
        'Signed' in signedtxn1_pending &&
        'AlgorandTransactionSigned' in signedtxn1_pending.Signed
      ) {
        signedtxn1_pending_2 =
          signedtxn1_pending.Signed.AlgorandTransactionSigned
            .signed_transaction_bytes;
      } else {
        throw new Error(
          '[Add Pending Contributor Txn 1] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      let signedtxn2_pending_2;
      if (
        'Signed' in signedtxn2_pending &&
        'AlgorandTransactionSigned' in signedtxn2_pending.Signed
      ) {
        signedtxn2_pending_2 =
          signedtxn2_pending.Signed.AlgorandTransactionSigned
            .signed_transaction_bytes;
      } else {
        throw new Error(
          '[Add Pending Contributor Txn 2] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      let signedtxn3_pending_2;
      if (
        'Signed' in signedtxn3_pending &&
        'AlgorandTransactionSigned' in signedtxn3_pending.Signed
      ) {
        signedtxn3_pending_2 =
          signedtxn3_pending.Signed.AlgorandTransactionSigned
            .signed_transaction_bytes;
      } else {
        throw new Error(
          '[Add Pending Contributor Txn 3] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      // send group transaction
      const result = await sendJoinPoolPendingTxn(
        [signedtxn1_pending_2, signedtxn2_pending_2, signedtxn3_pending_2],
        client,
        txn2?.addPendingTxn_ID!
      );
      return result;
    } catch (err) {
      console.log(err);
    }
  };

  claimContributorMethod = async (
    client: algosdk.Algodv2,
    appID: number | bigint,
    //contributorAccount: algosdk.Account,
    contributorAddr: algosdk.Account['addr'],
    contributorAssetId: number,
    vault_id: string,
    auth_password: string
  ) => {
    try {
      // transaction 1 - Optin to drt
      const txn1 = await createAssetOptinTxn_new(
        contributorAssetId,
        contributorAddr,
        client
      );

      // sign transaction
      const signedtxn1 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn1?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn1_2;
      if (
        'Signed' in signedtxn1 &&
        'AlgorandTransactionSigned' in signedtxn1.Signed
      ) {
        signedtxn1_2 =
          signedtxn1.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Contributor Asset Optin Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      const txn1Result = await sendAssetOptinTxn(
        signedtxn1_2,
        client,
        txn1?.txnID!
      );

      let txn2 = await createClaimContributorTxn(
        appID,
        client,
        contributorAddr,
        contributorAssetId
      );

      // sign transaction
      const signedtxn2 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn2?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn2_2;
      if (
        'Signed' in signedtxn2 &&
        'AlgorandTransactionSigned' in signedtxn2.Signed
      ) {
        signedtxn2_2 =
          signedtxn2.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Claim Contributor Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const result = await sendClaimContributorTxn(
        signedtxn2_2,
        client,
        txn2?.txnID!
      );

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
    executionFee: number,
    vault_id: string,
    auth_password: string
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

      // sign transaction asset transfer
      const signedtxn1_execute = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn?.modifiedTransaction_assetTransfer)
            ]) // Add "TX" prefix tag
          }
        }
      });
      // sign transaction payment
      const signedtxn2_execute = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn?.modifiedTransaction_ExecuteFee)
            ]) // Add "TX" prefix tag
          }
        }
      });
      const signedtxn3_execute = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn?.modifiedTransaction_executeDRTTxn)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn1_execute_2;
      if (
        'Signed' in signedtxn1_execute &&
        'AlgorandTransactionSigned' in signedtxn1_execute.Signed
      ) {
        signedtxn1_execute_2 =
          signedtxn1_execute.Signed.AlgorandTransactionSigned
            .signed_transaction_bytes;
      } else {
        throw new Error(
          '[Execute Txn 1] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      let signedtxn2_execute_2;
      if (
        'Signed' in signedtxn2_execute &&
        'AlgorandTransactionSigned' in signedtxn2_execute.Signed
      ) {
        signedtxn2_execute_2 =
          signedtxn2_execute.Signed.AlgorandTransactionSigned
            .signed_transaction_bytes;
      } else {
        throw new Error(
          '[Execute Txn 2] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      let signedtxn3_execute_2;
      if (
        'Signed' in signedtxn3_execute &&
        'AlgorandTransactionSigned' in signedtxn3_execute.Signed
      ) {
        signedtxn3_execute_2 =
          signedtxn3_execute.Signed.AlgorandTransactionSigned
            .signed_transaction_bytes;
      } else {
        throw new Error(
          '[Execute Txn 3] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      // send group transaction
      const result = await sendExecuteDRTTxn(
        [signedtxn1_execute_2, signedtxn2_execute_2, signedtxn3_execute_2],
        client,
        txn?.execeuteDRTTxn_ID!
      );
      return result;
    } catch (err) {
      console.log(err);
    }
  };
}
