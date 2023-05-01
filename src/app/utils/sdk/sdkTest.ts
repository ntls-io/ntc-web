import algosdk from "algosdk";


// create unsigned transaction
const testPayment = async (sender: algosdk.Account, amount: any, receiver: algosdk.Account, client: algosdk.Algodv2) => {
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

export { testPayment };