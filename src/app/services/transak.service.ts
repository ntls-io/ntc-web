import { Injectable } from '@angular/core';
import Transak, { Settings } from '@transak/transak-sdk';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AlgoService } from '../states/algo';
import { SessionQuery } from '../states/session';

const settings: Settings = environment.transak;

@Injectable({
  providedIn: 'root'
})
export class TransakService {
  transak = new Transak(settings);

  constructor(
    private sessionQuery: SessionQuery,
    private algoService: AlgoService
  ) {
    this.listen();
  }

  listen() {
    const { EVENTS } = this.transak;

    this.transak.on(EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      this.transak.close();
    });

    this.transak.on(EVENTS.TRANSAK_ORDER_SUCCESSFUL, ({ status }) => {
      const text = status?.status.split('_').join(' ').toLowerCase();
      Swal.fire({
        icon: 'success',
        text
      }).finally(() => this.algoService.getAccountData());
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
