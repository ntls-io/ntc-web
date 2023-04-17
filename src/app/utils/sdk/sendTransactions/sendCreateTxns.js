const algosdk = require('algosdk');

// CREATE APP
// create unsigned transaction
const sendDeployContract = async (signedTxn, client, txId) => {
  try {
    console.log('Signed transaction with txID: %s', txId);
    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    // Get the completed Transaction
    console.log(
      'Transaction ' +
        txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']
    );
    // display results
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    const appId = transactionResponse['application-index'];
    console.log('Created new app-id: ', appId);
    return appId;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendDeployContract };
