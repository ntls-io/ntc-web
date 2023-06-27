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
        digital_right_description: this.selectedDrt.description, 
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
    },
    {
      name: 'Median',
      description:
        'The median is the middle value of a dataset, robust to extreme values',
      checked: false
    },
    {
      name: 'K-Nearest Neighbors',
      description:
        'A non-parametric, supervised learning classifier, which uses proximity to make classifications or predictions about the grouping of an individual data point',
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