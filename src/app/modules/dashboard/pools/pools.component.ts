import { Component, OnInit } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { JoinPoolComponent } from 'src/app/components/join-pool/join-pool.component';

@Component({
  selector: 'app-pools',
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.css']
})
export class PoolsComponent implements OnInit {
  constructor(private modalService: BsModalService) {}

  ngOnInit(): void {}

  openJoinPool() {
    const initialState: ModalOptions = {
      initialState: {},
      class: 'modal-dialog-centered'
    };
    this.modalService.show(JoinPoolComponent, initialState);
  }
}
