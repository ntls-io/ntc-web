import algosdk from 'algosdk';

export const sendCreateDRTTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string,
  appID: any
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);

    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    const drtID = transactionResponse['inner-txns'][0]['asset-index'];
    return drtID;
  } catch (err) {
    console.log(err);
  }
};

export const sendClaimDRTTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string
) => {
  try {
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    return transactionResponse;
  } catch (err) {
    console.log(err);
  }
};
