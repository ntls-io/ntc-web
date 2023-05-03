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
    // console.log(txn1);

    const txId_1 = await txn1?.txID().toString();

    // Sign the transaction, here we have to intervene
    const creatorSecret = creatorAccount?.sk;
    const signedtxn1 = txn1?.signTxn(creatorSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    const appID = await sendDeployContractTxn(signedtxn1, client, txId_1!);
    // console.log(appID);

    /// Transaction 2 - Fund Contract
    var fundAmount = 1000000;
    const txn2 = await createFundContractTxn(
      appID,
      fundAmount,
      creatorAccount,
      client
    );
    // console.log(txn2);
    var txId_2 = await txn2?.txID().toString();
    // Sign the transaction, here we have to intervene
    const signedtxn2 = txn2?.signTxn(creatorSecret);
    // console.log(signedtxn2);
    const txn2Result = await sendFundContractTxn(
      signedtxn2,
      client,
      txId_2!,
      creatorAccount,
      appID,
      fundAmount
    );

    /// Transaction 3 - Setup Data Pool
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
    // console.log(txn3);
    var txId_3 = await txn3?.txID().toString();
    //Sign the transaction, here we have to intervene
    const enclaveSecret = enclaveAccount?.sk;
    const signedtxn3 = txn3?.signTxn(enclaveSecret);

    const setupResult = await sendSetupDataPoolTxn(signedtxn3, client, txId_3!);

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
    // console.log(signedtxn2);
    const txn4Result = await sendAssetOptinTxn(
      signedtxn4,
      client,
      txId_4!,
      creatorAccount
    );

    // Transaction 5 - claim contributor token
    const txn5 = await createInitClaimContributorTxn(
      appID,
      client,
      creatorAccount,
      setupResult?.contributorCreatorID,
      setupResult?.appendDrtID
    );
    // console.log(txn2);
    // console.log(txn5);
    var txId_5 = await txn5?.txID().toString();
    // Sign the transaction, here we have to intervene
    const signedtxn5 = txn5?.signTxn(creatorSecret);
    // console.log(signedtxn2);
    const txn5Result = await sendInitClaimContributorTxn(
      signedtxn5,
      client,
      txId_5!
    );
    const contributorCreatorID = setupResult?.contributorCreatorID;
    const appendDrtID = setupResult?.appendDrtID;
    // console.log(txn5Result);
    return { appID, contributorCreatorID, appendDrtID };
  } catch (err) {
    console.log(err);
  }
};

export { createDataPoolMethod };
