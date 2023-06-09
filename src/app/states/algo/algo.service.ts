import { Injectable } from '@angular/core';
import { Algodv2, IntDecoding } from 'algosdk';
import AlgodClient from 'algosdk/dist/types/client/v2/algod/algod';
import { environment } from 'src/environments/environment';
import { SessionQuery } from '../session';
import { AlgoStore } from './algo.store';

const {} = environment.algorand;

@Injectable({ providedIn: 'root' })
export class AlgoService {
  protected algodClient: AlgodClient;

  constructor(
    private algoStore: AlgoStore,
    private sessionQuery: SessionQuery
  ) {
    this.algodClient = this.getAlgodClientFromEnvironment();
  }

  /**
   * Construct an {@link AlgodClient} from {@link environment.algorand}.
   *
   * In particular, this enforces {@link IntDecoding.SAFE}: we don't currently accommodate `bigint` values.
   */
  getAlgodClientFromEnvironment(): Algodv2 {
    const { token, server, port } = environment.algorand;
    const client = new Algodv2(token, server, port);
    client.setIntEncoding(IntDecoding.SAFE);
    return client;
  }

  async getAccountData() {
    const { vault } = this.sessionQuery.getValue();
    if (!vault) return;
    await this.algodClient
      .accountInformation(vault.algorand_address_base32)
      .do()
      .then(accountInformation => {
        this.algoStore.update({ accountInformation });
      });
  }
}
