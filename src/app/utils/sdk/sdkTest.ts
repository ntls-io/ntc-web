import algosdk from 'algosdk';

// create unsigned transaction
const testPayment = async (
  sender: algosdk.Account,
  amount: any,
  receiver: algosdk.Account,
  client: algosdk.Algodv2
) => {
  try {
    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: receiver.addr,
      amount: amount,
      suggestedParams: params
    });

    const ptxnID = txn.txID().toString();
    // Sign the transaction, here we have to intervene
    const senderSecret = sender.sk;
    const signedPtxn = txn.signTxn(senderSecret);

    await client.sendRawTransaction(signedPtxn).do();
    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, ptxnID, 4);
    return confirmedTxn;
  } catch (err) {
    console.log(err);
  }
};

export const DEMO_approvalContributorTransaction = async (
  client: algosdk.Algodv2,
  appID: number | bigint,
  enclaveAccount: algosdk.Account,
  contributorAccount: algosdk.Account
) => {
  try {
    // DEMO for testing: enclave contributor approval instruction
    const params = await client.getTransactionParams().do();
    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const DEMO_approvalContributorTransaction =
      algosdk.makeApplicationCallTxnFromObject({
        from: enclaveAccount.addr,
        appIndex: Number(appID),
        suggestedParams: params,
        onComplete: onComplete,
        appArgs: [
          new Uint8Array(Buffer.from('add_contributor_approved')),
          new Uint8Array(Buffer.from(algosdk.encodeUint64(7))),
          new Uint8Array(Buffer.from('DGVWUSNA--new_confirm--ASUDBQ')),
          new Uint8Array(Buffer.from(algosdk.encodeUint64(1)))
        ],
        accounts: [contributorAccount.addr],
        boxes: [
          {
            appIndex: Number(appID),
            name: algosdk.decodeAddress(contributorAccount.addr).publicKey
          }
        ]
      });

    const txId = await DEMO_approvalContributorTransaction.txID().toString();

    // Sign the transaction, here we have to intervene
    const enclaveSecret = enclaveAccount.sk;
    const signedtxn =
      DEMO_approvalContributorTransaction.signTxn(enclaveSecret);
    // pai(username, password, signedTxn)
    // intervene above with authenticateion

    await client.sendRawTransaction(signedtxn).do();
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

export { testPayment };
