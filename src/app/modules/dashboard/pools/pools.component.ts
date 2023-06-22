import { Component, OnInit } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { JoinPoolComponent } from 'src/app/components/join-pool/join-pool.component';
import { PoolDataQuery } from 'src/app/states/pool-data';

@Component({
  selector: 'app-pools',
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.css']
})
export class PoolsComponent implements OnInit {
  hardcoded_poolData = [
    {
      id: '1',
      name: 'Human Genome Lab results',
      description: 'Complex Genomics Analytics from human placenta DNA.',
      drt: [
        {
          name: 'Average',
          description:
            'Allow others to calculate averages on integer values in your data'
        },
        {
          name: 'Standard Deviation',
          description:
            'Allow others to calculate standard deviation on integer values in your data'
        },
        {
          name: 'Append',
          description: 'Allow others to append their data and join your pool'
        }
      ]
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
            'Allow others to calculate averages on integer values in your data'
        },
        {
          name: 'Standard Deviation',
          description:
            'Allow others to calculate standard deviation on integer values in your data'
        },
        {
          name: 'Append',
          description: 'Allow others to append their data and join your pool'
        }
      ]
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
            'Allow others to calculate averages on integer values in your data'
        },
        {
          name: 'Standard Deviation',
          description:
            'Allow others to calculate standard deviation on integer values in your data'
        },
        {
          name: 'Append',
          description: 'Allow others to append their data and join your pool'
        }
      ]
    }
  ];
  getPoolData: any;
  merge_data: any;

  constructor(
    private modalService: BsModalService,
    public poolDataQuery: PoolDataQuery
  ) {
    this.getPoolData = this.poolDataQuery.getAll();
    this.merge_data = this.getPoolData.push(this.hardcoded_poolData);
  }

  ngOnInit(): void {}

  openJoinPool(id: string) {
    const initialState: ModalOptions = {
      initialState: { id },
      class: 'modal-dialog-centered'
    };
    this.modalService.show(JoinPoolComponent, initialState);
  }
}
