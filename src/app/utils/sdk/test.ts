// require("dotenv").config();
const algosdk = require('algosdk');

const { createDeployContractTxn } = require('./createTransactions/createTxns');
const { sendDeployContract } = require('./sendTransactions/sendCreateTxns');
// const { auth }.. require///

// get test accounts from mnemonic d`
const creatorMnemonic =
  'asthma genuine aunt dumb concert solar blast spy monster before sudden census denial hope cost wasp legal system angle soup evolve young guilt able width';

const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
const enclave = algosdk.generateAccount();

// Client setup, get these values from process env files instead
const algodToken =
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const baseServer = 'http://localhost';
const port = '4001';
// const headers = { "X-API-Key": process.env.REACT_APP_API_KEY };
const client = new algosdk.Algodv2(algodToken, baseServer, port);

const testCreateDataPoolMethod = async () => {
  const txn = await createDeployContractTxn(creatorAccount, enclave, client);
  console.log(txn);
  const txId = await txn.txID().toString();

  // Sign the transaction, here we have to intervene
  const creatorSecret = creatorAccount.sk;
  const signedTxn = txn.signTxn(creatorSecret);
  // pai(username, password, signedTxn)
  // intervene above with authenticateion

  const txnResult = await sendDeployContract(signedTxn, client, txId);

  console.log(txnResult);
};

testCreateDataPoolMethod();
