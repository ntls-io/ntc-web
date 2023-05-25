import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-join-pool',
  templateUrl: './join-pool.component.html',
  styleUrls: ['./join-pool.component.scss']
})
export class JoinPoolComponent {
  constructor(public bsModalRef: BsModalRef) {}
}
