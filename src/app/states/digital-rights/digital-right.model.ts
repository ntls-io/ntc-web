import { ID } from '@datorama/akita';

export interface DigitalRight {
  id: string;
  name: string,
  description: string,
  digital_right: string,
  price: string
}

export function createDigitalRight(params: Partial<DigitalRight>) {
  return {

  } as DigitalRight;
}
