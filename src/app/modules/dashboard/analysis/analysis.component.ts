import { Component, OnInit } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RedeemComponent } from 'src/app/components/redeem/redeem.component';
import { AnalysisDigitalRight, AnalysisDigitalRightsQuery, ClusterResult } from 'src/app/states/analysis-digital-rights';
@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
  enableSellButton = false;
  digitalRights: AnalysisDigitalRight[] = [];

  constructor(
    private modalService: BsModalService,
    private analysisDigitalRightsQuery: AnalysisDigitalRightsQuery) {}
  
    ngOnInit(): void {
      this.digitalRights = this.analysisDigitalRightsQuery.getAll();
  }

  redeemDrt(name: string, digital_right: string, results: string | ClusterResult) {
    const initialState: ModalOptions = {
      initialState: { selectedResult: { name, digital_right, results } },
      class: 'modal-dialog-centered'
    };
    this.modalService.show(RedeemComponent, initialState);
  }
  

}
