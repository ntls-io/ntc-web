import {
  createDeployContractTxn,
  createFundContractTxn,
  createInitClaimContributorTxn,
  DEMO_createSetupDataPoolTxn
} from '../createTransactions/dataPoolCreationTxns';

import {
  sendDeployContractTxn,
  sendFundContractTxn,
  sendInitClaimContributorTxn,
  sendSetupDataPoolTxn
} from '../sendTransactions/sendCreateTxns';

import algosdk from 'algosdk';
import { createAssetOptinTxn } from '../createTransactions/utilityTxns';
import { sendAssetOptinTxn } from '../sendTransactions/sendUtilityTxns';

const createDataPoolMethod = async (
  creatorAccount: algosdk.Account,
  enclaveAccount: algosdk.Account,
  client: algosdk.Algodv2
) => {
  try {
    /// Transaction 1 - Deploy Contract
    let txn1 = await createDeployContractTxn(
      creatorAccount,
      enclaveAccount,
      client
    );

    const txId_1 = await txn1?.txID().toString();

    // Sign the transaction, here we have to intervene
    const creatorSecret = creatorAccount?.sk;
    const signedtxn1 = txn1?.signTxn(creatorSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const appID = await sendDeployContractTxn(signedtxn1, client, txId_1!);
    console.log('Deployment Txn confirmed, app ID: ', appID);

    /// Transaction 2 - Fund Contract
    var fundAmount = 2000000;
    const txn2 = await createFundContractTxn(
      appID,
      fundAmount,
      creatorAccount,
      client
    );
    var txId_2 = await txn2?.txID().toString();
    // Sign the transaction, here we have to intervene
    const signedtxn2 = txn2?.signTxn(creatorSecret);
    const txn2Result = await sendFundContractTxn(
      signedtxn2,
      client,
      txId_2!,
      creatorAccount,
      appID,
      fundAmount
    );
    console.log(
      'Fund Smart Contract Txn confirmed in round: ',
      txn2Result!['confirmed-round']
    );

    /// Transaction 3 - Setup Data Pool DEMO
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
      creatorAccount,
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
    //Sign the transaction, here we have to intervene
    const enclaveSecret = enclaveAccount?.sk;
    const signedtxn3 = txn3?.signTxn(enclaveSecret);
    const setupResult = await sendSetupDataPoolTxn(signedtxn3, client, txId_3!);
    console.log(
      'DEMO enclave Setup Txn confirmed, setup results: ',
      setupResult
    );

    // transaction 4 - Optin to contributor token
    const txn4 = await createAssetOptinTxn(
      setupResult?.contributorCreatorID,
      creatorAccount,
      client
    );
    // console.log(txn2);
    var txId_4 = await txn4?.txID().toString();
    // Sign the transaction, here we have to intervene
    const signedtxn4 = txn4?.signTxn(creatorSecret);
    const txn4Result = await sendAssetOptinTxn(signedtxn4, client, txId_4!);
    console.log(
      'Asset optin txn confirmed in round: ',
      txn4Result!['confirmed-round']
    );

    // Transaction 5 - claim contributor token
    const txn5 = await createInitClaimContributorTxn(
      appID,
      client,
      creatorAccount,
      setupResult?.contributorCreatorID,
      setupResult?.appendDrtID
    );
    var txId_5 = await txn5?.txID().toString();
    // Sign the transaction, here we have to intervene
    const signedtxn5 = txn5?.signTxn(creatorSecret);
    const txn5Result = await sendInitClaimContributorTxn(
      signedtxn5,
      client,
      txId_5!
    );
    console.log(
      'Claim contributor Txn confirmed in round: ',
      txn5Result!['confirmed-round']
    );
    const contributorCreatorID = setupResult?.contributorCreatorID;
    const appendDrtID = setupResult?.appendDrtID;
    return { appID, contributorCreatorID, appendDrtID };
  } catch (err) {
    console.log(err);
  }
};

export { createDataPoolMethod };
