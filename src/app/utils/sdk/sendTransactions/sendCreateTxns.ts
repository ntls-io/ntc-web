import algosdk from 'algosdk';
import * as assert from 'assert';

// CREATE APP
// create unsigned transaction
export const sendDeployContractTxn = async (signedTxn: any,
  client: algosdk.Algodv2,
  txId: string) => {
  try {
    //console.log('Signed transaction with txID: %s', txId);
    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();

    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    // Get the completed Transaction
    // console.log(
    //   'Deploy Contract Transaction ' +
    //     txId +
    //     ' confirmed in round ' +
    //     confirmedTxn['confirmed-round']
    // );
    // display results
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    // console.log(transactionResponse);
    const appId = transactionResponse['application-index'];

    // console.log('Created new app-id: ', appId);

    return appId;
  } catch (err) {
    console.log(err);
  }
};

export const sendFundContractTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string,
  sender: { addr: any; },
  appID: any,
  fundAmount: number
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);
    // console.log('Signed transaction with txID: %s', txId);
    const senderInfo = await client.accountInformation(sender.addr).do();
    assert(
      senderInfo.amount > fundAmount,
      'Not enough funds in senders account.'
    );

    const contractInfo = await client.accountInformation(contractAddr).do();
    // console.log(contractInfo.amount);
    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    // Get the completed Transaction
    // console.log(
    //   'Smart Contract Funding Transaction ' +
    //     txId +
    //     ' confirmed in round ' +
    //     confirmedTxn['confirmed-round']
    // );
    // display results
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();
    return transactionResponse;
  } catch (err) {
    console.log(err);
  }
};

export const sendSetupDataPoolTxn = async (
  signedTxn: any,
  client: algosdk.Algodv2,
  txId: string) => {
  try {
   // console.log('Signed transaction with txID: %s', txId);
    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    // Get the completed Transaction
    // console.log(
    //   'Data Pool Initialisation Transaction ' +
    //     txId +
    //     ' confirmed in round ' +
    //     confirmedTxn['confirmed-round']
    // );
    // display results
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();

    const appendDrtID = transactionResponse['inner-txns'][0]['asset-index'];
    const contributorCreatorID =
      transactionResponse['inner-txns'][1]['asset-index'];
    // const result =
    return { appendDrtID, contributorCreatorID };
  } catch (err) {
    console.log(err);
  }
};

export const sendInitClaimContributorTxn = async (signedTxn: any,
  client: algosdk.Algodv2,
  txId: string) => {
  try {
   //  console.log('Signed transaction with txID: %s', txId);
    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);

    // Get the completed Transaction
    // console.log(
    //   'Claim Contributor Initialisation Transaction ' +
    //     txId +
    //     ' confirmed in round ' +
    //     confirmedTxn['confirmed-round']
    // );
    // display results
    const transactionResponse = await client
      .pendingTransactionInformation(txId)
      .do();

    // const appendDrtID = transactionResponse['inner-txns'][0]['asset-index'];
    // const contributorCreatorID =
    //   transactionResponse['inner-txns'][1]['asset-index'];
    return transactionResponse;
  } catch (err) {
    console.log(err);
  }
};

exports = {
  sendDeployContractTxn,
  sendSetupDataPoolTxn,
  sendFundContractTxn,
  sendInitClaimContributorTxn
};
