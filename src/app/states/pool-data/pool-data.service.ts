import { Injectable, } from '@angular/core';
import { PoolData } from './pool-data.model';
import { PoolDataStore } from './pool-data.store';
import { PoolDataQuery } from './pool-data.query';

@Injectable({ providedIn: 'root' })
export class PoolDataService {
  public merge_data: PoolData[] = [];
  constructor(
    private poolDataStore: PoolDataStore,
    private poolDataQuery: PoolDataQuery
  ) {}
  

  private hardcoded_poolData: PoolData[] = [
    {
      id: '1',
      name: 'Human Genome Lab results',
      description: 'Complex Genomics Analytics from human placenta DNA.',
      drt: [
        {
          name: 'Average',
          description:
            'Allow others to calculate averages on integer values in your data',
        },
        {
          name: 'Standard Deviation',
          description:
            'Allow others to calculate standard deviation on integer values in your data',
        },
        {
          name: 'Append',
          description: 'Allow others to append their data and join your pool',
        },
      ],
    },
    {
      id: '2',
      name: 'National Survey Financial Analytics',
      description:
        'Household financial analysis over set categories of wealth brackets.',
      drt: [
        {
          name: 'Average',
          description:
            'Allow others to calculate averages on integer values in your data',
        },
        {
          name: 'Standard Deviation',
          description:
            'Allow others to calculate standard deviation on integer values in your data',
        },
        {
          name: 'Append',
          description: 'Allow others to append their data and join your pool',
        },
      ],
    },
    {
      id: '3',
      name: 'Blood oxygen & EKG results',
      description:
        'Collection of data from cardio unit at HopX. Heart rates and blood oxygen versus age.',
      drt: [
        {
          name: 'Average',
          description:
            'Allow others to calculate averages on integer values in your data',
        },
        {
          name: 'Standard Deviation',
          description:
            'Allow others to calculate standard deviation on integer values in your data',
        },
        {
          name: 'Append',
          description: 'Allow others to append their data and join your pool',
        },
      ],
    },
  ];

  createPool(data: PoolData) {
    this.poolDataStore.add(data);
    this.fetchPoolData();
  }

  fetchPoolData() {
    const getPoolData = this.poolDataQuery.getAll();
    this.merge_data = [...getPoolData, ...this.hardcoded_poolData];
  }
}