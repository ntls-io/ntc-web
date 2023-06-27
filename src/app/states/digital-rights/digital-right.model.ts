export interface DigitalRight {
  id: string;
  name: string,
  description: string,
  digital_right: string,
  digital_right_description: string,
  price: string
}

export function createDigitalRight(params: Partial<DigitalRight>) {
  return {

  } as DigitalRight;
}
