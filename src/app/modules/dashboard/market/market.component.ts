import { Component, OnInit } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { CheckoutComponent } from 'src/app/components/checkout/checkout.component';
import { DigitalRightsQuery, DigitalRight } from 'src/app/states/digital-rights';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {
  digitalRights: DigitalRight[] = [];
  digitalRightsSubscription: Subscription | undefined;
  
  constructor(
    private modalService: BsModalService, 
    public digitalRightsQuery: DigitalRightsQuery) {}

  ngOnInit(): void{
    this.digitalRightsSubscription = this.digitalRightsQuery.selectAll().subscribe(
      (digitalRights: DigitalRight[]) => {
        this.digitalRights = digitalRights;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.digitalRightsSubscription) {
      this.digitalRightsSubscription.unsubscribe();
    }
  }

  buyDrt(id: string, name: string, description: string, digital_right: string) {
    const initialState: ModalOptions = {
      initialState: { selectedDrtData: { id, name, description, digital_right } },
      class: 'modal-dialog-centered'
    };
    this.modalService.show(CheckoutComponent, initialState);
  }
}
