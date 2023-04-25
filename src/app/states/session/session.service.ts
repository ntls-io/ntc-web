import { Injectable } from '@angular/core';
import { CreateVaultResult, OpenVaultResult } from 'src/app/schema/actions';
import { EnclaveService } from 'src/app/services/enclave.service';
import { SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(
    private sessionStore: SessionStore,
    private enclaveService: EnclaveService
  ) {}

  async login(
    vault_id: string,
    auth_password: string
  ): Promise<string | undefined> {
    try {
      const result: OpenVaultResult = await this.enclaveService.openVault({
        vault_id,
        auth_password
      });

      if ('Opened' in result) {
        const vault = result.Opened;
        this.sessionStore.update({ vault });
        return 'success';
      } else if ('InvalidAuth' in result) {
        throw new Error(
          'Authentication failed, please ensure that the address and password provided is correct.'
        );
      } else if ('Failed' in result) {
        throw new Error(result.Failed);
      } else {
        console.error(result);
      }
    } catch (error) {
      throw new Error(
        'There was a problem accessing your vault, please try again.'
      );
    }
  }

  async register(username: string, auth_password: string) {
    try {
      const result: CreateVaultResult = await this.enclaveService.createVault({
        username,
        auth_password
      });
      if ('Created' in result) {
        return result.Created;
      } else if ('Failed' in result) {
        throw new Error(result.Failed);
      } else {
        console.error(result);
      }
    } catch (error) {
      throw new Error(
        'There was a problem creating your vault, please try again.'
      );
    }
  }
}
