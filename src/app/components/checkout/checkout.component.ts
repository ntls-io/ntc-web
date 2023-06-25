import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AnalysisDigitalRight, AnalysisDigitalRightsStore } from 'src/app/states/analysis-digital-rights';
import { DigitalRightsStore, DigitalRightsQuery } from 'src/app/states/digital-rights';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  id: string = '';
  selectedDrtData: SelectedDrtData | null = null;
  constructor(
    public bsModalRef: BsModalRef,
    private analysisDigitalRightsStore: AnalysisDigitalRightsStore,
    private digitalRightsStore: DigitalRightsStore,
    private digitalRightsQuery: DigitalRightsQuery) {}

  confirmPurchase(){
    if (this.selectedDrtData) {
      const data: AnalysisDigitalRight = {
        id: Math.random().toString(36).slice(-3),
        name: this.selectedDrtData.name,
        description: this.selectedDrtData.description,
        digital_right: this.selectedDrtData.digital_right, 
      }
      this.analysisDigitalRightsStore.add(data);
      this.digitalRightsStore.remove(this.selectedDrtData.id);
      this.digitalRightsQuery.getAll()
    }
    this.bsModalRef.hide();
  }
}

interface SelectedDrtData {
  id: string;
  name: string;
  description: string;
  digital_right: string;
}