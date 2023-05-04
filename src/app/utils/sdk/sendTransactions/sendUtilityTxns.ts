import algosdk from 'algosdk';

export const sendAssetOptinTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string,
  account: any
) => {
  try {
    // Submit the transaction
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

export const sendPaymentTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string,
  account: any
) => {
  try {
    //   console.log('Signed transaction with txID: %s', txId);

    // Submit the transaction
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

exports = {
  sendAssetOptinTxn,
  sendPaymentTxn
};
