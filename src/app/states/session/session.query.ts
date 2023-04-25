import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { SessionState, SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class SessionQuery extends Query<SessionState> {
  username = this.select(state => state.vault?.username);

  constructor(protected sessionStore: SessionStore) {
    super(sessionStore);
  }

  isAuthenticated(): boolean {
    return !!this.getValue().vault?.vault_id;
  }
}
