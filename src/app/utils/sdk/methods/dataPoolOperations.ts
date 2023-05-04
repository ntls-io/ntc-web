import algosdk from 'algosdk';

import {
  createClaimDRTTxn,
  createCreateDRTTxn
} from '../createTransactions/dataPoolOperationTxns';
import {
  sendClaimDRTTxn,
  sendCreateDRTTxn
} from '../sendTransactions/sendDataPoolTxns';

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

export { createDRTMethod };
