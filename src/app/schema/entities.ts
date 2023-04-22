/** Structures representing various entities. */

import {
  AlgorandAccountSeedBytes,
  AlgorandAddressBase32,
  WalletId
} from './types';

/** A Nautilus wallet's basic displayable details. */
export type WalletDisplay = {
  wallet_id: WalletId;
  owner_name: string;
  phone_number?: string;
  algorand_address_base32: AlgorandAddressBase32;
};

// Algorand entities:

/** An Algorand account. */
export type AlgorandAccount = {
  seed_bytes: AlgorandAccountSeedBytes;
};
