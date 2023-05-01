import * as fs from 'fs';
import * as path from 'path';
import algosdk from 'algosdk';
import * as assert from 'assert';
import { send } from 'process';

// create unsigned transaction
export const createAssetOptinTxn = async (assetID: any, account: { addr: string; }, client: algosdk.Algodv2) => {
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
      account.addr,
      account.addr,
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


module.exports = {
  createAssetOptinTxn
};
