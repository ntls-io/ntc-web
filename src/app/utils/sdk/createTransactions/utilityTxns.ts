import algosdk from 'algosdk';

// create unsigned transaction
export const createAssetOptinTxn = async (
  assetID: any,
  accountAddr: algosdk.Account['addr'],
  client: algosdk.Algodv2
) => {
  try {
    const params = await client.getTransactionParams().do();

    // We set revocationTarget to undefined as
    // This is not a clawback operation
    let revocationTarget = undefined;
    // CloseReaminerTo is set to undefined as
    // we are not closing out an asset
    let closeRemainderTo = undefined;

    const note = undefined;

    // signing and sending "txn" allows sender to begin accepting asset specified by creator and index
    let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      accountAddr,
      accountAddr,
      closeRemainderTo,
      revocationTarget,
      Number(0),
      note,
      Number(assetID),
      params
    );

    return opttxn;
  } catch (err) {
    console.log(err);
  }
};

export const createPaymentTxn = async (
  sender: string,
  amount: any,
  receiver: string,
  client: algosdk.Algodv2
) => {
  try {
    const appArgs = [];

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      to: receiver,
      amount: amount,
      suggestedParams: params
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};

export const createAssetTransferTxn = async (
  client: algosdk.Algodv2,
  sender: string,
  receiver: string,
  assetID: number | bigint,
  amount: number | bigint
) => {
  try {
    const appArgs = [];

    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: sender,
      to: receiver,
      assetIndex: Number(assetID),
      amount: Number(amount),
      suggestedParams: params
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  createAssetOptinTxn,
  createPaymentTxn,
  createAssetTransferTxn
};
