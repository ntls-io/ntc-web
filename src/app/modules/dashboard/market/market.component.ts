import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CheckoutComponent } from 'src/app/components/checkout/checkout.component';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent {
  constructor(private modalService: BsModalService) {}

  buyDrt() {
    this.modalService.show(CheckoutComponent, {
      class: 'modal-dialog-centered'
    });
  }
}
