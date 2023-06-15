export interface PoolData {
  name: string;
  description: string;
  drt: string[];
}

export function createPoolDatum(params: Partial<PoolData>) {
  return {} as PoolData;
}
