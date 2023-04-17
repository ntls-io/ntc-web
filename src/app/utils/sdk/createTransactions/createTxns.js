// require('dotenv').config();
const path = require('path');
const fs = require('fs');
const algosdk = require('algosdk');

// Read Teal File
const readTeal = async () => {
  let approvalProgram = '';
  let clearStateProgram = '';

  try {
    approvalProgram = fs.readFileSync(
      path.resolve(__dirname, '../contract/approval.teal'),
      'utf8'
    );
    clearStateProgram = fs.readFileSync(
      path.resolve(__dirname, '../contract/clear.teal'),
      'utf8'
    );

    return [approvalProgram, clearStateProgram];
    // console.log(approvalProgram);
    // console.log(clearStateProgram);
  } catch (err) {
    console.error(err);
  }
};

// Compile Program
const compileContract = async (client, programSource) => {
  const encoder = new TextEncoder();
  const programBytes = encoder.encode(programSource);
  const compileResponse = await client.compile(programBytes).do();
  const compiledBytes = new Uint8Array(
    Buffer.from(compileResponse.result, 'base64')
  );
  return compiledBytes;
};

// create unsigned transaction
const createDeployContractTxn = async (creator, enclave, client) => {
  try {
    // declare application state storage (immutable)
    const localInts = 0;
    const localBytes = 0;
    const globalInts = 10; // # 4 for setup + 20 for choices. Use a larger number for more choices.
    const globalBytes = 5;

    const appArgs = [];

    const params = await client.getTransactionParams().do();
    const program = await readTeal();

    const compiledApprovalProgram = await compileContract(client, program[0]);
    const compiledClearProgram = await compileContract(client, program[1]);

    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    params.fee = 1000;
    params.flatFee = true;

    const extraPagesNo = 2;

    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: creator.addr,
      suggestedParams: params,
      onComplete: onComplete,
      approvalProgram: compiledApprovalProgram,
      clearProgram: compiledClearProgram,
      numLocalInts: localInts,
      numLocalByteSlices: localBytes,
      numGlobalByteSlices: globalBytes,
      numGlobalInts: globalInts,
      appArgs: appArgs,
      accounts: [enclave.addr],
      extraPages: extraPagesNo
    });

    return txn;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createDeployContractTxn };
