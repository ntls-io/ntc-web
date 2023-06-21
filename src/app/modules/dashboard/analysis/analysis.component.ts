import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RedeemComponent } from 'src/app/components/redeem/redeem.component';
@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent {
  enableSellButton = false;

  constructor(private modalService: BsModalService) {}

  redeemDrt() {
    this.modalService.show(RedeemComponent, {
      class: 'modal-dialog-centered'
    });
  }

}
