export interface DRT {
  name: string;
  description: string;
}

export interface PoolData {
  id: string;
  name: string;
  description: string;
  drt: DRT[];
}

export function createPoolDatum(params: Partial<PoolData>) {
  return {} as PoolData;
}
