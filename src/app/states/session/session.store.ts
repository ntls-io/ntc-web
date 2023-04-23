import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { WalletDisplay } from 'src/app/schema/entities';

export interface SessionState {
  /**
   * The current session's wallet details, as loaded from the wallet enclave.
   *
   * @see SessionService
   */
  wallet?: WalletDisplay;

  /**
   * The current session's user-supplied authentication PIN.
   */
  auth_pin?: string;
}

export function createInitialState(): SessionState {
  return {
    wallet: undefined,
    auth_pin: undefined
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'session', resettable: true })
export class SessionStore extends Store<SessionState> {
  constructor() {
    super(createInitialState());
  }
}
