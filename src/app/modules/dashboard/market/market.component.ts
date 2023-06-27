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
        this.digitalRights = [...digitalRights, ...this.harcodedDrts];
      }
    );
  }

  ngOnDestroy(): void {
    if (this.digitalRightsSubscription) {
      this.digitalRightsSubscription.unsubscribe();
    }
  }

  buyDrt(id: string, name: string, description: string, digital_right: string, digital_right_description: string) {
    const initialState: ModalOptions = {
      initialState: { selectedDrtData: { id, name, description, digital_right, digital_right_description } },
      class: 'modal-dialog-centered'
    };
    this.modalService.show(CheckoutComponent, initialState);
  }

  harcodedDrts: DigitalRight[] = [
    { id: '101',
      name: 'Human Genome Lab results',
      description: 'Complex Genomics Analytics from human placenta DNA.',
      digital_right: 'Average',
      digital_right_description: 'Allow others to calculate averages on integer values in your data',
      price: '5'},

      { id: '102',
      name: 'Human Genome Lab results',
      description: 'Complex Genomics Analytics from human placenta DNA.',
      digital_right: 'Standard Deviation',
      digital_right_description: 'A measure of the amount of variation or dispersion in a dataset',
      price: '5'},

      { id: '103',
      name: 'Human Genome Lab results',
      description: 'Complex Genomics Analytics from human placenta DNA.',
      digital_right: 'Append',
      digital_right_description: 'Allow others to append their data and join your pool',
      price: '5'},

      { id: '104',
      name: 'National Survey Financial Analytics',
      description: 'Household financial analysis over set categories of wealth brackets.',
      digital_right: 'Average',
      digital_right_description: 'Allow others to calculate averages on integer values in your data',
      price: '5'},

      { id: '105',
      name: 'National Survey Financial Analytics',
      description: 'Household financial analysis over set categories of wealth brackets.',
      digital_right: 'Standard Deviation',
      digital_right_description: 'A measure of the amount of variation or dispersion in a dataset',
      price: '5'},

      { id: '106',
      name: 'National Survey Financial Analytics',
      description: 'Household financial analysis over set categories of wealth brackets.',
      digital_right: 'Append',
      digital_right_description: 'Allow others to append their data and join your pool',
      price: '5'},
  ]
}
