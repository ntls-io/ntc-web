/** Core request / response message types. */

import { VaultDisplay } from './entities';
import { Bytes, VaultId, VaultPassword } from './types';

export type CreateVault = {
  username: string;
  auth_password: string;
};

export type CreateVaultResult = { Created: VaultDisplay } | { Failed: string };

export type OpenVault = {
  vault_id: VaultId;
  auth_password: VaultPassword;
};

export type OpenVaultResult =
  | { Opened: VaultDisplay }
  | { InvalidAuth: null }
  | { Failed: string };

export type SignTransaction = {
  vault_id: VaultId;
  auth_password: VaultPassword;

  transaction_to_sign: TransactionToSign;
};

/** For {@link SignTransaction}: A choice of type of transaction to sign. */
export type TransactionToSign =
  /** An unsigned Algorand transaction. */
  { AlgorandTransaction: { transaction_bytes: Bytes } };

export type SignTransactionResult =
  | { Signed: TransactionSigned }
  | { InvalidAuth: null }
  | { Failed: string };

/** For {@link SignTransactionResult}: The possible types of signed transactions. */
export type TransactionSigned =
  /** A signed Algorand transaction. */
  { AlgorandTransactionSigned: { signed_transaction_bytes: Bytes } };

/** Dispatching enum for action requests. */
export type VaultRequest =
  | { OpenVault: OpenVault }
  | { SignTransaction: SignTransaction };

/** Dispatching enum for action results. */
export type VaultResponse =
  | { OpenVault: OpenVaultResult }
  | { SignTransaction: SignTransactionResult };
