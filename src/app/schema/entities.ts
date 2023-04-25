/** Structures representing various entities. */

import {
  AlgorandAccountSeedBytes,
  AlgorandAddressBase32,
  VaultId
} from './types';

export type VaultDisplay = {
  vault_id: VaultId;
  username: string;
  algorand_address_base32: AlgorandAddressBase32;
};

// Algorand entities:

/** An Algorand account. */
export type AlgorandAccount = {
  seed_bytes: AlgorandAccountSeedBytes;
};
