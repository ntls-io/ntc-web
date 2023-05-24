import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import algosdk from 'algosdk';
import { lastValueFrom } from 'rxjs';
import { to_msgpack } from 'src/app/schema/msgpack';
import { EnclaveService } from 'src/app/services/enclave.service';
import {
  createDeployContractTxn,
  createFundContractTxn
} from '../../createTransactions/dataPoolCreationTxns';
import {
  sendDeployContractTxn,
  sendFundContractTxn
} from '../../sendTransactions/sendCreateTxns';

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

      let signedtxn1_1;
      if (
        'Signed' in signedtxn1 &&
        'AlgorandTransactionSigned' in signedtxn1.Signed
      ) {
        signedtxn1_1 =
          signedtxn1.Signed.AlgorandTransactionSigned.signed_transaction_bytes;
      } else {
        throw new Error(
          '[Deploy Smart Contract Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
        );
      }

      const appID = await sendDeployContractTxn(
        signedtxn1_1,
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

      // /// Transaction 3 - Setup Data Pool DEMO
      // var noRowsContributed = 4;
      // var dataPoolHash = 'HBKHJB-DataPool-DJKDB';
      // var appendDRTName = 'Append DRT';
      // var appendDRTUnitName = 'DRT';
      // var appendDRTSupply = 1;
      // var appendDRTPrice = 1000000;
      // var appendDRTurlBinary = 'https://url_append_binary';
      // var appendDRTBinaryHash = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

      // const txn3 = await DEMO_createSetupDataPoolTxn(
      //   appID,
      //   enclaveAccount,
      //   client,
      //   creatorAddr,
      //   noRowsContributed,
      //   dataPoolHash,
      //   appendDRTName,
      //   appendDRTUnitName,
      //   appendDRTSupply,
      //   appendDRTPrice,
      //   appendDRTurlBinary,
      //   appendDRTBinaryHash
      // );
      // var txId_3 = await txn3?.txID().toString();
      // //Sign the transaction, this is a DEMO TRANSACTION
      // const enclaveSecret = enclaveAccount?.sk;
      // const signedtxn3 = txn3?.signTxn(enclaveSecret);
      // const setupResult = await sendSetupDataPoolTxn(
      //   signedtxn3,
      //   client,
      //   txId_3!
      // );
      // console.log(
      //   'DEMO enclave Setup Txn confirmed, setup results: ',
      //   setupResult
      // );

      // // transaction 4 - Optin to contributor token
      // const txn4 = await createAssetOptinTxn(
      //   setupResult?.contributorCreatorID,
      //   creatorAddr,
      //   client
      // );
      // var txId_4 = await txn4?.txID().toString();

      // // TBR
      // // Sign the transaction, here we have to intervene
      // const signedtxn4 = await this.enclaveService.signTransaction({
      //   vault_id: vault_id,
      //   auth_password: auth_password,
      //   transaction_to_sign: {
      //     AlgorandTransaction: {
      //       transaction_bytes: new Uint8Array(to_msgpack(txn4))
      //     }
      //   }
      // });
      // const txn4Result = await sendAssetOptinTxn(signedtxn4, client, txId_4!);
      // console.log(
      //   'Asset optin txn confirmed in round: ',
      //   txn4Result!['confirmed-round']
      // );

      // // Transaction 5 - claim contributor token
      // const txn5 = await createInitClaimContributorTxn(
      //   appID,
      //   client,
      //   creatorAddr,
      //   setupResult?.contributorCreatorID,
      //   setupResult?.appendDrtID
      // );
      // var txId_5 = await txn5?.txID().toString();
      // // Sign the transaction, here we have to intervene
      // const signedtxn5 = await this.enclaveService.signTransaction({
      //   vault_id: vault_id,
      //   auth_password: auth_password,
      //   transaction_to_sign: {
      //     AlgorandTransaction: {
      //       transaction_bytes: new Uint8Array(to_msgpack(txn5))
      //     }
      //   }
      // });
      // const txn5Result = await sendInitClaimContributorTxn(
      //   signedtxn5,
      //   client,
      //   txId_5!
      // );
      // console.log(
      //   'Claim contributor Txn confirmed in round: ',
      //   txn5Result!['confirmed-round']
      // );
      // const contributorCreatorID = setupResult?.contributorCreatorID;
      // const appendDrtID = setupResult?.appendDrtID;
      //return txn1;
      //return { appID, contributorCreatorID, appendDrtID };
      return appID;
    } catch (err) {
      console.error('Error in createDataPoolMethod:', err);
      throw err; // Rethrow the error to be handled by the caller
    }
  };
}
