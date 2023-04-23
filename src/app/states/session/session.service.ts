import { Injectable } from '@angular/core';
import { OpenWalletResult } from 'src/app/schema/actions';
import { EnclaveService } from 'src/app/services/enclave.service';
import { SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(
    private sessionStore: SessionStore,
    private enclaveService: EnclaveService
  ) {}

  async login(
    wallet_id: string,
    auth_pin: string
  ): Promise<string | undefined> {
    const result: OpenWalletResult = await this.enclaveService.openWallet({
      wallet_id,
      auth_pin
    });

    console.log('result', result);

    if ('Opened' in result) {
      const wallet = result.Opened;
      this.sessionStore.update({ wallet, auth_pin });
      return 'success';
    } else if ('InvalidAuth' in result) {
      throw new Error(
        'Authentication failed, please ensure that the address and password provided is correct.'
      );
    } else if ('Failed' in result) {
      console.error(result);
      throw new Error(result.Failed);
    } else {
      console.error(result);
    }
  }
}
