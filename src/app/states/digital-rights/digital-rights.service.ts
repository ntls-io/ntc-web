import { Injectable } from '@angular/core';
import { DigitalRightsStore, } from './digital-rights.store';
import { DigitalRight } from './digital-right.model';
import { DigitalRightsQuery } from './digital-rights.query';


@Injectable({ providedIn: 'root' })
export class DigitalRightsService {
  merge_drts: DigitalRight[] = [];

  constructor(
    private digitalRightsStore: DigitalRightsStore, 
    private digitalRightsQuery: DigitalRightsQuery) {
  }

    hardcodedDrt: DigitalRight[] = [
    {
      id: '7',
      name: 'Human Genome Lab results',
      description: 'Complex Genomics Analytics from human placenta DNA.',
      digital_right: 'Standard Deviations',
      digital_right_description: 'A measure of the amount of variation or dispersion in a dataset',
      price: '5'
    },
    {
      id: '8',
      name: 'Human Genome Lab results',
      description: 'Complex Genomics Analytics from human placenta DNA.',
      digital_right: 'Mean Averages',
      digital_right_description: 'Allow others to calculate averages on integer values in your data',
      price: '5'
    },
    {
      id: '9',
      name: 'National Survey Financial Analytics',
      description: 'Household financial analysis over set categories of wealth brackets.',
      digital_right: 'Standard Deviations',
      digital_right_description: 'A measure of the amount of variation or dispersion in a dataset',
      price: '5'
    },
    {
      id: '10',
      name: 'National Survey Financial Analytics',
      description: 'Household financial analysis over set categories of wealth brackets.',
      digital_right: 'Standard Deviations',
      digital_right_description: 'A measure of the amount of variation or dispersion in a dataset',
      price: '5'
    },
  ];

  issueDrt(data: DigitalRight) {
    this.digitalRightsStore.add(data);
    this.fetchDrts();
  }

  fetchDrts() {
    const getDrts = this.digitalRightsQuery.getAll();
    this.merge_drts = [...getDrts, ...this.hardcodedDrt];
  }

}
