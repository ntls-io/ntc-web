import { Injectable } from '@angular/core';
import Transak from '@transak/transak-sdk';
import { environment } from 'src/environments/environment';
import { SessionQuery } from '../states/session';

@Injectable({
  providedIn: 'root'
})
export class TransakService {
  transak: Transak;

  constructor(private sessionQuery: SessionQuery) {
    const { vault } = this.sessionQuery.getValue();
    const { apiKey, cryptoCurrencyCode } = environment.transak;

    this.transak = new Transak({
      apiKey,
      cryptoCurrencyCode,
      environment: environment.production ? 'PRODUCTION' : 'STAGING',
      widgetHeight: '550px',
      walletAddress: vault?.algorand_address_base32,
      email: vault?.username
    });

    this.listen();
  }

  listen() {
    const { ALL_EVENTS, EVENTS } = this.transak;

    // To get all the events
    this.transak.on(ALL_EVENTS, data => {
      console.log(data);
    });

    // This will trigger when the user closed the widget
    this.transak.on(EVENTS.TRANSAK_WIDGET_CLOSE, orderData => {
      console.log(orderData);
      this.transak.close();
    });

    // This will trigger when the user marks payment is made
    this.transak.on(EVENTS.TRANSAK_ORDER_SUCCESSFUL, orderData => {
      console.log(orderData);
      this.transak.close();
    });
  }

  open() {
    this.transak.init();
  }
}
