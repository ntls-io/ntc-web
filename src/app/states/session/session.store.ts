import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { VaultDisplay } from 'src/app/schema/entities';

export interface SessionState {
  vault?: VaultDisplay;
  auth_password?: string;
}

export function createInitialState(): SessionState {
  return {
    vault: undefined,
    auth_password: undefined
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'session', resettable: true })
export class SessionStore extends Store<SessionState> {
  constructor() {
    super(createInitialState());
  }
}
