import { Injectable } from '@angular/core';
import Transak, { Settings } from '@transak/transak-sdk';
import { environment } from 'src/environments/environment';
import { SessionQuery } from '../states/session';

const settings: Settings = environment.transak;

@Injectable({
  providedIn: 'root'
})
export class TransakService {
  transak = new Transak(settings);

  constructor(private sessionQuery: SessionQuery) {
    this.listen();
  }

  listen() {
    const { EVENTS } = this.transak;

    this.transak.on(EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      this.transak.close();
    });

    this.transak.on(EVENTS.TRANSAK_ORDER_SUCCESSFUL, () => {
      //TODO: handle successful order & update vault balance
      this.transak.close();
    });
  }

  open() {
    const { vault } = this.sessionQuery.getValue();

    this.transak = new Transak({
      ...settings,
      walletAddress: vault?.algorand_address_base32,
      email: vault?.username
    });

    this.transak.init();
  }
}
