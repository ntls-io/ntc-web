import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.scss']
})
export class RedeemComponent {
  constructor(public bsModalRef: BsModalRef) {}

  harcode_results = [
    {
      result: 4,
      pool: 'Lab Data for Proj X',
      digital_right: 'average'
      },
      {
      result: 2,
      pool: 'Lab Data for Proj X',
      digital_right: 'standard deviation'
      },
  ]
}
