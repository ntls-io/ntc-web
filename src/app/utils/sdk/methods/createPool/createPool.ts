import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import algosdk from 'algosdk';
import { lastValueFrom } from 'rxjs';
import { to_msgpack } from 'src/app/schema/msgpack';
import { EnclaveService } from 'src/app/services/enclave.service';
import {
  createDeployContractTxn,
  createFundContractTxn,
  createInitClaimContributorTxn,
  DEMO_createSetupDataPoolTxn
} from '../../createTransactions/dataPoolCreationTxns';
import { createAssetOptinTxn_new } from '../../createTransactions/utilityTxns';
import {
  sendDeployContractTxn,
  sendFundContractTxn,
  sendInitClaimContributorTxn,
  sendSetupDataPoolTxn
} from '../../sendTransactions/sendCreateTxns';
import { sendAssetOptinTxn } from '../../sendTransactions/sendUtilityTxns';

/**
 * This service handles all transactions related the creation of a data pool on algorands network
 */
@Injectable({
  providedIn: 'root'
})
export class PoolCreate {
  constructor(
    private enclaveService: EnclaveService,
    private http: HttpClient
  ) {}

  Debug_initclaim = async (
    client: algosdk.Algodv2,
    // creatorAccount: algosdk.Account, //to be removed (TBR) when signing functionality is imported
    enclaveAccount: algosdk.Account, // to be removed
    creatorAddr: algosdk.Account['addr'],
    enclaveAddr: algosdk.Account['addr'],
    vault_id: string,
    auth_password: string,
    appID: number,
    contributorCreatorID: number,
    appendDrtID: number
  ) => {
    try {
      // Transaction 3 - Setup Data Pool DEMO meant to come our backend
      var noRowsContributed = 4;
      var dataPoolHash = 'HBKHJB-DataPool-DJKDB';
      var appendDRTName = 'Append DRT';
      var appendDRTUnitName = 'DRT';
      var appendDRTSupply = 1;
      var appendDRTPrice = 1000000;
      var appendDRTurlBinary = 'https://url_append_binary';
      var appendDRTBinaryHash = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

      const txn3 = await DEMO_createSetupDataPoolTxn(
        appID,
        enclaveAccount,
        client,
        creatorAddr,
        noRowsContributed,
        dataPoolHash,
        appendDRTName,
        appendDRTUnitName,
        appendDRTSupply,
        appendDRTPrice,
        appendDRTurlBinary,
        appendDRTBinaryHash
      );
      //console.log(txn3);
      var txId_3 = await txn3?.txID().toString();
      //Sign the transaction, this is a DEMO TRANSACTION
      const enclaveSecret = enclaveAccount?.sk;
      const signedtxn3 = txn3?.signTxn(enclaveSecret);
      // Decode the signed transaction
      const decodedTxn = algosdk.decodeSignedTransaction(signedtxn3!);

      // Access transaction properties
      // Access the sender address
      console.log('decoded signed tranasction boxes', decodedTxn.txn.boxes); // Access the sender address

      // Transaction 5 - claim contributor token
      const txn5 = await createInitClaimContributorTxn(
        appID,
        client,
        creatorAddr,
        contributorCreatorID,
        appendDrtID
      );

      // Sign the transaction, here we have to intervene
      const signedtxn5 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn5?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn5_2;
      if (
        'Signed' in signedtxn5 &&
        'AlgorandTransactionSigned' in signedtxn5.Signed
      ) {
        signedtxn5_2 =
          signedtxn5.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Contributor Init Claim Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      const decodedTxn_2 = algosdk.decodeSignedTransaction(signedtxn5_2!);

      // Access transaction propertie
      console.log('decoded signed tranasction enclave boxes', decodedTxn_2.txn);
      console.log(
        'decoded signed tranasction enclave boxes',
        decodedTxn_2.txn.boxes
      ); // Access the sender address
      // Object{publicKey: Uint8Array{0: 1, 1: 252, 2: 221, 3: 179, 4: 139, 5: 245, 6: 147, 7: 26, 8: 53, 9: 219, 10: 156, 11: 224, 12: 74, 13: 154, 14: 147, 15: 160, 16: 220, 17: 71, 18: 58, 19: 228, 20: 49, 21: 209, 22: 85, 23: 82, 24: 110, 25: 26, 26: 111, 27: 59, 28: 72, 29: 174, 30: 139, 31: 76}, checksum: Uint8Array{0: 60, 1: 175, 2: 62, 3: 78}}
      const txn5Result = await sendInitClaimContributorTxn(
        signedtxn5_2,
        client,
        txn5?.txnID!
      );
      return txn5Result;
    } catch (err) {
      console.error('Error in createDataPoolMethod:', err);
      throw err; // Rethrow the error to be handled by the caller
    }
  };

  async getFileContent(fileName: string): Promise<string> {
    const url = `assets/contract/${fileName}`;

    try {
      const fileContent = this.http.get(url, {
        responseType: 'text',
        headers: new HttpHeaders({
          'Content-Type': 'text/plain; charset=utf-8'
        })
      });

      const resultFileContent = await lastValueFrom(fileContent);
      return resultFileContent;
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error; // Rethrow the error to propagate it to the caller
    }
  }

  createDataPoolMethod = async (
    client: algosdk.Algodv2,
    // creatorAccount: algosdk.Account, //to be removed (TBR) when signing functionality is imported
    enclaveAccount: algosdk.Account, // to be removed
    creatorAddr: algosdk.Account['addr'],
    enclaveAddr: algosdk.Account['addr'],
    vault_id: string,
    auth_password: string
  ) => {
    try {
      const approvalProgram = await this.getFileContent('approval.teal');
      const clearProgram = await this.getFileContent('clear.teal');
      // console.log(approvalProgram);
      /// Transaction 1 - Deploy Contract
      let txn1 = await createDeployContractTxn(
        creatorAddr,
        enclaveAddr,
        client,
        approvalProgram,
        clearProgram
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
          '[Deploy Smart Contract Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const appID = await sendDeployContractTxn(
        signedtxn1_2,
        client,
        txn1?.txnID!
      );

      /// Transaction 2 - Fund Contract
      var fundAmount = 2000000;
      const txn2 = await createFundContractTxn(
        appID,
        fundAmount,
        creatorAddr,
        client
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
          '[Fund Smart Contract Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const txn2Result = await sendFundContractTxn(
        signedtxn2_2,
        client,
        txn2?.txnID!,
        creatorAddr,
        appID,
        fundAmount
      );

      // Transaction 3 - Setup Data Pool DEMO meant to come our backend
      var noRowsContributed = 4;
      var dataPoolHash = 'HBKHJB-DataPool-DJKDB';
      var appendDRTName = 'Append DRT';
      var appendDRTUnitName = 'DRT';
      var appendDRTSupply = 1;
      var appendDRTPrice = 1000000;
      var appendDRTurlBinary = 'https://url_append_binary';
      var appendDRTBinaryHash = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

      const txn3 = await DEMO_createSetupDataPoolTxn(
        appID,
        enclaveAccount,
        client,
        creatorAddr,
        noRowsContributed,
        dataPoolHash,
        appendDRTName,
        appendDRTUnitName,
        appendDRTSupply,
        appendDRTPrice,
        appendDRTurlBinary,
        appendDRTBinaryHash
      );
      //console.log(txn3);
      var txId_3 = await txn3?.txID().toString();
      //Sign the transaction, this is a DEMO TRANSACTION
      const enclaveSecret = enclaveAccount?.sk;
      const signedtxn3 = txn3?.signTxn(enclaveSecret);
      const setupResult = await sendSetupDataPoolTxn(
        signedtxn3,
        client,
        txId_3!
      );
      console.log(
        'DEMO enclave Setup Txn confirmed, setup results: ',
        setupResult
      );

      // transaction 4 - Optin to contributor token
      const txn4 = await createAssetOptinTxn_new(
        setupResult?.contributorCreatorID,
        creatorAddr,
        client
      );

      // sign transaction
      const signedtxn4 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn4?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn4_2;
      if (
        'Signed' in signedtxn4 &&
        'AlgorandTransactionSigned' in signedtxn4.Signed
      ) {
        signedtxn4_2 =
          signedtxn4.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Append Asset Optin Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }
      const txn4Result = await sendAssetOptinTxn(
        signedtxn4_2,
        client,
        txn4?.txnID!
      );

      // Transaction 5 - claim contributor token
      const txn5 = await createInitClaimContributorTxn(
        appID,
        client,
        creatorAddr,
        setupResult?.contributorCreatorID,
        setupResult?.appendDrtID
      );

      // Sign the transaction, here we have to intervene
      const signedtxn5 = await this.enclaveService.signTransaction({
        vault_id: vault_id,
        auth_password: auth_password,
        transaction_to_sign: {
          AlgorandTransaction: {
            transaction_bytes: new Uint8Array([
              0x54,
              0x58,
              ...to_msgpack(txn5?.modifiedTransaction)
            ]) // Add "TX" prefix tag
          }
        }
      });

      let signedtxn5_2;
      if (
        'Signed' in signedtxn5 &&
        'AlgorandTransactionSigned' in signedtxn5.Signed
      ) {
        signedtxn5_2 =
          signedtxn5.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Contributor Init Claim Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const txn5Result = await sendInitClaimContributorTxn(
        signedtxn5_2,
        client,
        txn5?.txnID!
      );

      const contributorCreatorID = setupResult?.contributorCreatorID;
      const appendDrtID = setupResult?.appendDrtID;

      return { appID, contributorCreatorID, appendDrtID };
    } catch (err) {
      console.error('Error in createDataPoolMethod:', err);
      throw err; // Rethrow the error to be handled by the caller
    }
  };
}
