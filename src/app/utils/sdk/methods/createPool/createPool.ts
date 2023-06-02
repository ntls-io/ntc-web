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
    enclaveAccount: algosdk.Account,
    creatorAddr: algosdk.Account['addr'],
    enclaveAddr: algosdk.Account['addr'],
    vault_id: string,
    auth_password: string
  ) => {
    try {
      const approvalProgram = await this.getFileContent('approval.teal');
      const clearProgram = await this.getFileContent('clear.teal');

      let txn1, signedtxn1_2, appID;
      try {
        txn1 = await createDeployContractTxn(
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

        if (
          'Signed' in signedtxn1 &&
          'AlgorandTransactionSigned' in signedtxn1.Signed
        ) {
          signedtxn1_2 =
            signedtxn1.Signed.AlgorandTransactionSigned
              .signed_transaction_bytes;
        } else {
          throw new Error(
            '[Deploy Smart Contract Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
          );
        }

        appID = await sendDeployContractTxn(signedtxn1_2, client, txn1?.txnID!);
      } catch (error) {
        console.error('Error in txn1 - createDeployContractTxn:', error);
        throw error;
      }

      let txn2, signedtxn2_2;
      try {
        var fundAmount = 2000000;
        txn2 = await createFundContractTxn(
          appID,
          fundAmount,
          creatorAddr,
          client
        );

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

        if (
          'Signed' in signedtxn2 &&
          'AlgorandTransactionSigned' in signedtxn2.Signed
        ) {
          signedtxn2_2 =
            signedtxn2.Signed.AlgorandTransactionSigned
              .signed_transaction_bytes;
        } else {
          throw new Error(
            '[Fund Smart Contract Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
          );
        }

        await sendFundContractTxn(
          signedtxn2_2,
          client,
          txn2?.txnID!,
          creatorAddr,
          appID,
          fundAmount
        );
      } catch (error) {
        console.error('Error in txn2 - sendFundContractTxn:', error);
        throw error;
      }

      let signedtxn3, setupResult;
      try {
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

        var txId_3 = await txn3?.txID().toString();

        const enclaveSecret = enclaveAccount?.sk;
        signedtxn3 = txn3?.signTxn(enclaveSecret);

        setupResult = await sendSetupDataPoolTxn(signedtxn3, client, txId_3!);
        console.log(
          'DEMO enclave Setup Txn confirmed, setup results: ',
          setupResult
        );
      } catch (error) {
        console.error('Error in txn3 - DEMO_createSetupDataPoolTxn:', error);
        throw error;
      }

      let txn4, signedtxn4_2;
      try {
        txn4 = await createAssetOptinTxn_new(
          setupResult?.contributorCreatorID,
          creatorAddr,
          client
        );

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

        if (
          'Signed' in signedtxn4 &&
          'AlgorandTransactionSigned' in signedtxn4.Signed
        ) {
          signedtxn4_2 =
            signedtxn4.Signed.AlgorandTransactionSigned
              .signed_transaction_bytes;
        } else {
          throw new Error(
            '[Append Asset Optin Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
          );
        }

        await sendAssetOptinTxn(signedtxn4_2, client, txn4?.txnID!);
      } catch (error) {
        console.error('Error in txn4 - createAssetOptinTxn_new:', error);
        throw error;
      }

      let txn5, signedtxn5_2;
      try {
        txn5 = await createInitClaimContributorTxn(
          appID,
          client,
          creatorAddr,
          setupResult?.contributorCreatorID,
          setupResult?.appendDrtID
        );

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

        if (
          'Signed' in signedtxn5 &&
          'AlgorandTransactionSigned' in signedtxn5.Signed
        ) {
          signedtxn5_2 =
            signedtxn5.Signed.AlgorandTransactionSigned
              .signed_transaction_bytes;
        } else {
          throw new Error(
            '[Contributor Init Claim Txn] - Failed to retrieve signed transaction bytes from enclave service signed transaction'
          );
        }

        await sendInitClaimContributorTxn(signedtxn5_2, client, txn5?.txnID!);
      } catch (error) {
        console.error('Error in txn5 - createInitClaimContributorTxn:', error);
        throw error;
      }

      const contributorCreatorID = setupResult?.contributorCreatorID;
      const appendDrtID = setupResult?.appendDrtID;

      return { appID, contributorCreatorID, appendDrtID };
    } catch (err) {
      console.error('Error in createDataPoolMethod:', err);
      throw err; // Rethrow the error to be handled by the caller
    }
  };
}
