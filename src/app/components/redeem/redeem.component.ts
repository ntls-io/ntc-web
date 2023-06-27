import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ClusterResult } from 'src/app/states/analysis-digital-rights';

@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.scss']
})
export class RedeemComponent {
  constructor(public bsModalRef: BsModalRef) {}

  selectedResult?: Results;
  
  isStringResult(): boolean {
    return typeof this.selectedResult?.results === 'string';
  }

  getClusters(results: string | ClusterResult | undefined): string | undefined {
    if (typeof results === 'string') {
      return '5';
    } else {
      return results?.clusters;
    }
  }

  getK(results: string | ClusterResult | undefined): string | undefined {
    if (typeof results === 'string') {
      return '5';
    } else {
      return results?.k;
    }
  }
}


interface Results {
  name: string, 
  digital_right: string, 
  results: string | ClusterResult
}
