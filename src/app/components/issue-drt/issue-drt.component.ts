import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DigitalRightsStore, DigitalRight } from 'src/app/states/digital-rights';

@Component({
  selector: 'app-issue-drt',
  templateUrl: './issue-drt.component.html',
  styleUrls: ['./issue-drt.component.scss']
})
export class IssueDrtComponent {
  selectedDrt!: SelectedDrt;
  selectedDrtData: SelectedDrtData | null = null;
  constructor(
    public bsModalRef: BsModalRef,
    private digitalRightsStore: DigitalRightsStore) {}

  selectDrt(drt: any) {
    this.selectedDrt = drt;
  }

  issueDrt() {
    if (this.selectedDrt && this.selectedDrtData) {
      const data: DigitalRight = {
        id: Math.random().toString(36).slice(-3),
        name: this.selectedDrtData.name,
        description: this.selectedDrtData.description,
        digital_right: this.selectedDrt.name, 
        price: '5'
      }
      this.digitalRightsStore.add(data)
    }

    this.bsModalRef.hide();
  }
  
  drtOptions = [
    {
      name: 'Append',
      description: 'Allow others to append their data and join your pool',
      checked: false
    },
    {
      name: 'Average',
      description:
        'Allow others to calculate averages on integer values in your data',
      checked: false
    }
  ];

}

interface SelectedDrtData {
  name: string;
  description: string;
}

interface SelectedDrt {
  name: string;
  description: string;
}