import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { SessionState, SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class SessionQuery extends Query<SessionState> {
  owner_name = this.select(state => state.wallet?.owner_name);

  constructor(protected sessionStore: SessionStore) {
    super(sessionStore);
  }

  isAuthenticated(): boolean {
    return !!this.getValue().wallet?.wallet_id;
  }
}
