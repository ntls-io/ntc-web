import { Component, OnInit } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { JoinPoolComponent } from 'src/app/components/join-pool/join-pool.component';
import { PoolData, PoolDataQuery, PoolDataService } from 'src/app/states/pool-data';

@Component({
  selector: 'app-pools',
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.css']
})
export class PoolsComponent implements OnInit {
  poolData!: PoolData[];

  constructor(
    private modalService: BsModalService,
    public poolDataService: PoolDataService,
    public poolDataQuery: PoolDataQuery
  ) {}

  ngOnInit(): void {
    this.poolDataService.fetchPoolData()
    this.poolData = this.poolDataService.merge_data;
  }

  openJoinPool(id: string) {
    const initialState: ModalOptions = {
      initialState: { id },
      class: 'modal-dialog-centered'
    };
    this.modalService.show(JoinPoolComponent, initialState);
  }
}
