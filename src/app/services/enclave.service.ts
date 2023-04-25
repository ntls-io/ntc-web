import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { withLoggedExchange } from 'src/app/utils/console.helpers';
import { environment } from 'src/environments/environment';
import {
  CreateVault,
  CreateVaultResult,
  OpenVault,
  OpenVaultResult,
  SignTransaction,
  SignTransactionResult
} from '../schema/actions';
import { AttestationReport } from '../schema/attestation';
import { PublicKey, TweetNaClCrypto } from '../schema/crypto';
import { from_msgpack_as } from '../schema/msgpack';
import { seal_msgpack_as, unseal_msgpack_as } from '../schema/sealing';

/**
 * This service handles communication with the vault enclave.
 */
@Injectable({
  providedIn: 'root'
})
export class EnclaveService {
  constructor(private http: HttpClient) {}

  async getEnclaveReport(): Promise<AttestationReport> {
    const bytes = await this.vaultApiGetBytes('enclave-report');
    return from_msgpack_as<AttestationReport>(bytes);
  }

  async getEnclavePublicKey(): Promise<PublicKey> {
    const report: AttestationReport = await this.getEnclaveReport();
    // XXX: msgpack returns Array<number>: coerce to Uint8Array for tweetnacl
    return new Uint8Array(report.enclave_public_key);
  }

  async createVault(request: CreateVault): Promise<CreateVaultResult> {
    const vaultRequest = { CreateVault: request };
    const response = await this.postSealedExchange<
      { CreateVault: CreateVault },
      { CreateVault: CreateVaultResult }
    >(vaultRequest);
    const { CreateVault: result } = response;
    return result;
  }

  async openVault(request: OpenVault): Promise<OpenVaultResult> {
    const vaultRequest = { OpenVault: request };
    const response = await this.postSealedExchange<
      { OpenVault: OpenVault },
      { OpenVault: OpenVaultResult }
    >(vaultRequest);
    const { OpenVault: result } = response;
    return result;
  }

  async signTransaction(
    request: SignTransaction
  ): Promise<SignTransactionResult> {
    const vaultRequest = { SignTransaction: request };
    const response = await this.postSealedExchange<
      { SignTransaction: SignTransaction },
      { SignTransaction: SignTransactionResult }
    >(vaultRequest);
    const { SignTransaction: result } = response;
    return result;
  }

  // HTTP helpers

  protected async vaultApiGetBytes(path: string): Promise<Uint8Array> {
    const url = this.getVaultApiUrl(path);
    const arrayBuffer = await lastValueFrom(
      this.http.get(url, {
        responseType: 'arraybuffer'
      })
    );
    return arrayViewFromBuffer(arrayBuffer);
  }

  protected async vaultApiPostBytes(
    path: string,
    bytes: Uint8Array
  ): Promise<Uint8Array> {
    const url = this.getVaultApiUrl(path);
    const body = bufferFromArrayView(bytes);
    const arrayBuffer = await lastValueFrom(
      this.http.post(url, body, {
        responseType: 'arraybuffer'
      })
    );
    return arrayViewFromBuffer(arrayBuffer);
  }

  protected async postSealedExchange<Request, Response>(
    request: Request
  ): Promise<Response> {
    return withLoggedExchange(
      'EnclaveService.postSealedExchange:',
      () => this.postSealedExchangeInner(request),
      request
    );
  }

  protected async postSealedExchangeInner<Request, Response>(
    request: Request
  ): Promise<Response> {
    const clientCrypto = TweetNaClCrypto.new();

    const enclavePublicKey = await this.getEnclavePublicKey();

    const sealedRequestBytes = seal_msgpack_as<Request>(
      request,
      enclavePublicKey,
      clientCrypto
    );
    const sealedResponseBytes = await this.vaultApiPostBytes(
      'vault-operation',
      sealedRequestBytes
    );
    const response = unseal_msgpack_as<Response>(
      sealedResponseBytes,
      clientCrypto
    );
    if (response !== null) {
      return response;
    } else {
      console.error('XXX unsealing failed:', { sealedResponseBytes });
      throw new Error('unsealing response failed!');
    }
  }

  // Configuration helpers:

  protected getVaultApiUrl(path: string): string {
    return new URL(path, environment.nautilusVaultServer).toString();
  }
}

// Convert bytes between typed array views and buffers.
//
// Note that these types are similar and closely related, but not interchangeable:
// code that expects an ArrayBuffer may fail if given a Uint8Array, and vice versa.
//
// Also, note that TypeScript's type system does not actually distinguish these two,
// so this code checks the types at run-time to avoid hard-to-diagnose errors.

export const arrayViewFromBuffer = (buffer: ArrayBuffer): Uint8Array => {
  if (!(buffer instanceof ArrayBuffer)) {
    throw new TypeError('expected ArrayBuffer');
  }
  return new Uint8Array(buffer);
};

export const bufferFromArrayView = (view: Uint8Array): ArrayBuffer => {
  if (!(view instanceof Uint8Array)) {
    throw new TypeError('expected Uint8Array');
  }
  const begin = view.byteOffset;
  const end = view.byteOffset + view.byteLength;
  return view.buffer.slice(begin, end);
};
