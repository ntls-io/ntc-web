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
  constructor(
    private modalService: BsModalService,
    public poolDataQuery: PoolDataQuery
  ) {}

  ngOnInit(): void {}

  openJoinPool() {
    const initialState: ModalOptions = {
      initialState: {},
      class: 'modal-dialog-centered'
    };
    this.modalService.show(JoinPoolComponent, initialState);
  }
}
