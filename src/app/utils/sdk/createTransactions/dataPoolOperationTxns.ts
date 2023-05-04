import algosdk from 'algosdk';

// create unsigned transaction DEMO until the enclave can create their own transactions
export const createCreateDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creator: { addr: string },
  drtName: string,
  drtSupply: number | bigint,
  drtPrice: number | bigint,
  drtUrlBinary: string,
  drtBinaryHash: string
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);
    const appArgs = [
      new Uint8Array(Buffer.from('create_drt')),
      new Uint8Array(Buffer.from(drtName)),
      new Uint8Array(Buffer.from(algosdk.encodeUint64(drtSupply))),
      new Uint8Array(Buffer.from(drtUrlBinary)),
      new Uint8Array(Buffer.from(drtBinaryHash)),
      new Uint8Array(Buffer.from(algosdk.encodeUint64(drtPrice)))
    ];
    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creator.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      accounts: [creator.addr]
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};

export const createClaimDRTTxn = async (
  appID: number | bigint,
  client: algosdk.Algodv2,
  creator: { addr: string },
  drtID: number | bigint
) => {
  try {
    const contractAddr = algosdk.getApplicationAddress(appID);
    const appArgs = [new Uint8Array(Buffer.from('drt_to_box'))];
    const params = await client.getTransactionParams().do();

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const assetBytes = algosdk.encodeUint64(drtID);
    const pk = algosdk.decodeAddress(contractAddr).publicKey;
    var boxName = new Uint8Array(assetBytes.length + pk.length);
    boxName.set(assetBytes);
    boxName.set(pk, assetBytes.length);

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: creator.addr,
      appIndex: Number(appID),
      suggestedParams: params,
      onComplete: onComplete,
      appArgs: appArgs,
      foreignAssets: [Number(drtID)],
      boxes: [
        {
          appIndex: Number(appID),
          name: boxName
        }
      ]
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};
