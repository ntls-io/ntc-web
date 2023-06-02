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
    // Get the completed Transaction
    console.log(
      'Create DRT Transaction 1 - Create DRT ASA: ' +
        txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']
    );
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    const drtID = transactionResponse['inner-txns'][0]['asset-index'];
    return drtID;
  } catch (err) {
    console.log(err);
  }
};

export const sendStoreDRTTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string
) => {
  try {
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
    console.log(
      'Create DRT Transaction 2 - Store DRT in Box: ' +
        txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']
    );
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    return transactionResponse;
  } catch (err) {
    console.log(err);
  }
};

export const sendBuyDRTTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string
) => {
  try {
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 6);

    console.log(
      'Buy Group Transaction : ' +
        txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']
    );
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    return transactionResponse;
  } catch (err) {
    console.log(err);
  }
};

export const sendListDRTTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string
) => {
  try {
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
    console.log(
      'List DRT transaction: ' +
        txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']
    );
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    return transactionResponse;
  } catch (err) {
    console.log(err);
  }
};

export const sendDelistDRTTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string
) => {
  try {
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
    console.log(
      'De-List DRT transaction : ' +
        txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']
    );
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    return transactionResponse;
  } catch (err) {
    console.log(err);
  }
};

export const sendJoinPoolPendingTxn = async (
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

export const sendClaimContributorTxn = async (
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
export const sendExecuteDRTTxn = async (
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
