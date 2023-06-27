import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AnalysisDigitalRight, AnalysisDigitalRightsStore, ClusterResult } from 'src/app/states/analysis-digital-rights';
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
      let results: string | ClusterResult;
      if(this.selectedDrtData.digital_right !== 'K-Nearest Neighbors'){
        results = '5'
      } else {
        results = {
          clusters: '2', 
          k: '3'
        }
      }
      const data: AnalysisDigitalRight = {
        id: Math.random().toString(36).slice(-3),
        name: this.selectedDrtData.name,
        description: this.selectedDrtData.description,
        digital_right: this.selectedDrtData.digital_right,
        results: results
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
  digital_right_description: string;
}